import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'filesize' })
export class FileSizePipe implements PipeTransform {
  transform(sizeInBytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let i = 0;

    while (sizeInBytes >= 1024 && i < units.length - 1) {
      sizeInBytes /= 1024;
      i++;
    }

    return `${sizeInBytes.toFixed(0)}${units[i]}`;
  }
}
