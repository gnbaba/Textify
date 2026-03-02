
export function isImage(file: File): boolean {
  return file.type.startsWith('image/');
}
