import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class CartService {
  constructor() {}

  setToLocal(nameOfLocal, array) {
    return sessionStorage.setItem(nameOfLocal, JSON.stringify(array));
  }

  getFromLoacl(nameOfLocal) {
    return JSON.parse(sessionStorage.getItem(nameOfLocal));
  }
}
