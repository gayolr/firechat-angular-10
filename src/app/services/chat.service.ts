import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection
} from '@angular/fire/firestore';
import { Mensaje } from '../interface/mensaje.interface';
import { map } from 'rxjs/operators';

import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private itemsCollection: AngularFirestoreCollection<any>;
  public chats: Mensaje[] = [];
  public usuario: any = {};
  constructor(private afs: AngularFirestore, public authFire: AngularFireAuth) {
    this.authFire.authState.subscribe(user => {
      console.log('Estado del usaurio', user);
      if (!user) {
        return;
      }
      this.usuario.nombre = user.displayName;
      this.usuario.uid = user.uid;
    });
  }

  login(proveedor: string) {
    if (proveedor === 'google') {
      this.authFire.auth.signInWithPopup(new auth.GoogleAuthProvider());
    } else {
      this.authFire.auth.signInWithPopup(new auth.TwitterAuthProvider());
    }
  }

  logout() {
    this.usuario = {};
    this.authFire.auth.signOut();
  }

  cargarMensajes() {
    this.itemsCollection = this.afs.collection<Mensaje>('chats', ref =>
      ref.orderBy('fecha', 'desc').limit(5)
    );

    return this.itemsCollection.valueChanges().pipe(
      map(mensajes => {
        console.log(mensajes);
        this.chats = [];
        for (let mensaje of mensajes) {
          this.chats.unshift(mensaje);
        }
        return this.chats;
        /* this.chats = mensajes; */
      })
    );
  }

  agregarMensaje(texto: string) {
    // TODO falta el UID del usuario
    const mensaje: Mensaje = {
      nombre: 'Roberto',
      mensaje: texto,
      fecha: new Date().getTime(),
      uid: this.usuario.uid
    };
    return this.itemsCollection.add(mensaje);
  }
}
