import { inject, Injectable, signal } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  imageUrl = signal('');

  private storage = inject(AngularFireStorage);

  uploadImage = (file: File): Promise<string> => {
    const filePath = `zen_file/${Date.now()}_${file.name}`;
    const storageRef = this.storage.ref(filePath);

    return this.storage.upload(filePath, file).then(() => {
      return storageRef.getDownloadURL().toPromise();
    });
  };

  removeImage = (fileUrl: string): Observable<void> => {
    const storageRef = this.storage.refFromURL(fileUrl);
    return storageRef.delete().pipe(
      catchError((error) => {
        console.error('Error deleting file:', error);
        return throwError(() => error);
      })
    );
  };
}
