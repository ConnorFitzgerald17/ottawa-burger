"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";
import { ArrowLeft, ArrowRight, ImagePlus, Star, Trash2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ReviewImage } from "@/lib/types";

export function PhotoManager({ reviewId, images }: { reviewId: string; images: ReviewImage[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [alt, setAlt] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const supabase = createSupabaseBrowserClient();

  async function upload() {
    const file = fileRef.current?.files?.[0];
    if (!file || alt.trim().length < 3) return setMessage("Choose a photo and write useful alt text first.");
    setBusy(true); setMessage("");
    try {
      const compressed = await imageCompression(file, { maxWidthOrHeight: 2400, maxSizeMB: 2.5, fileType: "image/webp", useWebWorker: true });
      const path = `${reviewId}/${crypto.randomUUID()}.webp`;
      const { error: uploadError } = await supabase.storage.from("review-media").upload(path, compressed, { contentType: "image/webp" });
      if (uploadError) throw uploadError;
      const { error: rowError } = await supabase.from("review_images").insert({ review_id: reviewId, storage_path: path, alt: alt.trim(), sort_order: images.length, is_cover: images.length === 0 });
      if (rowError) { await supabase.storage.from("review-media").remove([path]); throw rowError; }
      setAlt(""); if (fileRef.current) fileRef.current.value = ""; router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "The photo could not be uploaded."); }
    finally { setBusy(false); }
  }

  async function makeCover(image: ReviewImage) {
    setBusy(true);
    await supabase.from("review_images").update({ is_cover: false }).eq("review_id", reviewId);
    const { error } = await supabase.from("review_images").update({ is_cover: true }).eq("id", image.id);
    setMessage(error?.message ?? ""); setBusy(false); router.refresh();
  }

  async function move(image: ReviewImage, direction: -1 | 1) {
    const index = images.findIndex((item) => item.id === image.id);
    const swap = images[index + direction];
    if (!swap) return;
    setBusy(true);
    await supabase.from("review_images").update({ sort_order: swap.sortOrder }).eq("id", image.id);
    await supabase.from("review_images").update({ sort_order: image.sortOrder }).eq("id", swap.id);
    setBusy(false); router.refresh();
  }

  async function remove(image: ReviewImage) {
    if (!window.confirm("Remove this photo from the review?")) return;
    setBusy(true);
    const path = new URL(image.url).pathname.split("/review-media/")[1];
    if (path) await supabase.storage.from("review-media").remove([decodeURIComponent(path)]);
    await supabase.from("review_images").delete().eq("id", image.id);
    setBusy(false); router.refresh();
  }

  return <div><div className="upload-drop" onClick={() => fileRef.current?.click()}><ImagePlus size={34}/><strong>Add a table photo</strong><span>JPEG, PNG, or WebP · resized before upload</span><input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={() => setMessage("")}/></div><div className="field" style={{ marginTop: "1rem" }}><label htmlFor="photo-alt">Photo description</label><input id="photo-alt" value={alt} onChange={(event) => setAlt(event.target.value)} placeholder="Classic cheeseburger and fries on a metal tray"/><button className="button" type="button" disabled={busy} onClick={upload}>{busy ? "Working…" : "Compress & upload"}</button></div>{message ? <p className="form-error" role="alert" style={{ marginTop: "1rem" }}>{message}</p> : null}<div className="upload-grid">{images.map((image, index) => <article className="upload-card" key={image.id}><div className="upload-preview"><Image src={image.url} alt={image.alt} fill sizes="300px"/></div><p className="help">{image.alt}</p><div style={{ display: "flex", gap: ".35rem", flexWrap: "wrap" }}><button type="button" title="Move left" disabled={busy || index === 0} onClick={() => move(image,-1)}><ArrowLeft/></button><button type="button" title="Move right" disabled={busy || index === images.length-1} onClick={() => move(image,1)}><ArrowRight/></button><button type="button" title="Make cover" disabled={busy || image.isCover} onClick={() => makeCover(image)}><Star fill={image.isCover ? "currentColor" : "none"}/></button><button type="button" title="Remove photo" disabled={busy} onClick={() => remove(image)}><Trash2/></button></div></article>)}</div></div>;
}
