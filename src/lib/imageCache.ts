/**
 * Image cache with two layers:
 *  1. Supabase (primary) — shared across ALL devices, generate once pay once
 *  2. IndexedDB (fallback) — per-device, used if Supabase is not configured
 *
 * geminiService.generateImage calls getCachedImage / cacheImage — no other changes needed.
 */

import { supabase } from './supabase';

// ── Supabase setup ───────────────────────────────────────────────────────────
const BUCKET = 'histopath-images';

// ── IndexedDB fallback ───────────────────────────────────────────────────────
const IDB_NAME = 'histopath-image-cache';
const IDB_STORE = 'images';

function openIDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(IDB_NAME, 1);
        req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function idbGet(key: string): Promise<string | null> {
    try {
        const db = await openIDB();
        return new Promise(resolve => {
            const req = db.transaction(IDB_STORE, 'readonly').objectStore(IDB_STORE).get(key);
            req.onsuccess = () => resolve(req.result ?? null);
            req.onerror = () => resolve(null);
        });
    } catch { return null; }
}

async function idbSet(key: string, value: string): Promise<void> {
    try {
        const db = await openIDB();
        return new Promise(resolve => {
            const tx = db.transaction(IDB_STORE, 'readwrite');
            tx.objectStore(IDB_STORE).put(value, key);
            tx.oncomplete = () => resolve();
            tx.onerror = () => resolve();
        });
    } catch { }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Stable key: hash the prompt so filenames are safe */
function promptKey(prompt: string): string {
    let hash = 0;
    for (let i = 0; i < prompt.length; i++) {
        hash = (Math.imul(31, hash) + prompt.charCodeAt(i)) | 0;
    }
    return Math.abs(hash).toString(36);
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Look up a cached image by prompt.
 * Checks Supabase first (shared), then IndexedDB (local fallback).
 * Returns a data URL or public Supabase URL, or null on miss.
 */
export async function getCachedImage(prompt: string): Promise<string | null> {
    // 1. Try Supabase DB lookup
    if (supabase) {
        try {
            const { data, error } = await supabase
                .from('image_cache')
                .select('image_url')
                .eq('prompt_hash', promptKey(prompt))
                .maybeSingle();

            if (!error && data?.image_url) {
                console.log('☁️ Image served from Supabase:', prompt.substring(0, 40));
                return data.image_url;
            }
        } catch (e) {
            console.warn('Supabase lookup failed, trying IndexedDB:', e);
        }
    }

    // 2. Fallback: IndexedDB
    const local = await idbGet(prompt);
    if (local) {
        console.log('🗄️ Image served from IndexedDB:', prompt.substring(0, 40));
        return local;
    }

    return null;
}

/**
 * Store a generated image.
 * Uploads to Supabase Storage + records URL in DB (shared across all devices).
 * Also saves to IndexedDB as a local copy for instant access.
 */
export async function cacheImage(prompt: string, dataUrl: string): Promise<void> {
    // Always write to IndexedDB for local speed
    await idbSet(prompt, dataUrl);

    if (!supabase) return;

    try {
        const key = promptKey(prompt);
        const fileName = `${key}.png`;

        // Convert data URL to Blob for upload
        const res = await fetch(dataUrl);
        const blob = await res.blob();

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from(BUCKET)
            .upload(fileName, blob, { contentType: 'image/png', upsert: true });

        if (uploadError) throw uploadError;

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
            .from(BUCKET)
            .getPublicUrl(fileName);

        // Record in DB so other devices can find it
        await supabase
            .from('image_cache')
            .upsert({ prompt_hash: key, image_url: publicUrl }, { onConflict: 'prompt_hash' });

        console.log('💾 Image cached to Supabase:', prompt.substring(0, 40));
    } catch (e) {
        // Supabase write failed — local IndexedDB copy is still there as fallback
        console.warn('Supabase cache write failed (IndexedDB copy kept):', e);
    }
}

// ── Utilities ────────────────────────────────────────────────────────────────

export async function getCacheSize(): Promise<{ supabase: number; local: number }> {
    let supabaseCount = 0;
    if (supabase) {
        const { count } = await supabase.from('image_cache').select('*', { count: 'exact', head: true });
        supabaseCount = count ?? 0;
    }
    try {
        const db = await openIDB();
        const local: number = await new Promise(resolve => {
            const req = db.transaction(IDB_STORE, 'readonly').objectStore(IDB_STORE).count();
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => resolve(0);
        });
        return { supabase: supabaseCount, local };
    } catch {
        return { supabase: supabaseCount, local: 0 };
    }
}

export async function clearLocalCache(): Promise<void> {
    try {
        const db = await openIDB();
        await new Promise<void>(resolve => {
            const tx = db.transaction(IDB_STORE, 'readwrite');
            tx.objectStore(IDB_STORE).clear();
            tx.oncomplete = () => resolve();
        });
    } catch { }
}
