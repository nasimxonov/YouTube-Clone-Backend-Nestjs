import fs from 'fs/promises';

async function deleteFile(folderPath: string) {
  try {
    await fs.rm(folderPath, { recursive: true, force: true });
    console.log(`Folder deleted: ${folderPath}`);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.log(`Folder does not exist, skipping: ${folderPath}`);
    } else {
      console.error(`Error deleting folder: ${folderPath}`, error);
    }
  }
}

export default deleteFile;
