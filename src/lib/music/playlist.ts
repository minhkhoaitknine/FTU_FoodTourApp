import { readdir, readFile } from "node:fs/promises";
import { extname, join } from "node:path";

const MUSIC_DIRECTORY = join(process.cwd(), "music");
const SUPPORTED_EXTENSIONS = new Set([".aac", ".flac", ".m4a", ".mp3", ".ogg", ".wav", ".webm"]);

export type BackgroundMusicTrack = {
  fileName: string;
  title: string;
  url: string;
  mimeType: string;
};

export async function listBackgroundMusicTracks() {
  const entries = await readdir(MUSIC_DIRECTORY, { withFileTypes: true }).catch(() => []);

  return entries
    .filter((entry) => entry.isFile() && SUPPORTED_EXTENSIONS.has(extname(entry.name).toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name, "vi"))
    .map((entry) => {
      const fileName = entry.name;

      return {
        fileName,
        title: titleFromFileName(fileName),
        url: `/api/background-music/${encodeURIComponent(fileName)}`,
        mimeType: mimeTypeForFile(fileName)
      } satisfies BackgroundMusicTrack;
    });
}

export async function readBackgroundMusicTrack(rawFileName: string) {
  const fileName = decodeURIComponent(rawFileName);
  const tracks = await listBackgroundMusicTracks();
  const track = tracks.find((item) => item.fileName === fileName);

  if (!track) return null;

  const data = await readFile(join(MUSIC_DIRECTORY, track.fileName));
  return { data, track };
}

function titleFromFileName(fileName: string) {
  const extension = extname(fileName);
  return fileName.slice(0, fileName.length - extension.length).trim() || fileName;
}

function mimeTypeForFile(fileName: string) {
  const extension = extname(fileName).toLowerCase();

  if (extension === ".aac") return "audio/aac";
  if (extension === ".flac") return "audio/flac";
  if (extension === ".m4a") return "audio/mp4";
  if (extension === ".mp3") return "audio/mpeg";
  if (extension === ".ogg") return "audio/ogg";
  if (extension === ".wav") return "audio/wav";
  if (extension === ".webm") return "audio/webm";
  return "application/octet-stream";
}
