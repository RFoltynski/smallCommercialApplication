import { CartService } from "./../cart.service";
import { HttpClient } from "@angular/common/http";
import * as moment from "moment";
import { Component } from "@angular/core";
import {
  trigger,
  transition,
  animate,
  style,
  state
} from "@angular/animations";

@Component({
  selector: "app-shopping-cart",
  templateUrl: "./shopping-cart.component.html",
  styleUrls: ["./shopping-cart.component.css"],
  animations: [
    trigger("fade", [
      state("void", style({ opacity: 0 })),
      transition("void => *", [animate(300)])
    ])
  ]
})
export class ShoppingCartComponent {
  // odfiltrowanie produktów które maja wartość quantity równą 0
  cartElements = this.cS.getFromLoacl("cartItems").filter(item => {
    return item.quantity !== 0;
  });

  sumPrice;
  cartProducts;
  quantity;

  constructor(private http: HttpClient, private cS: CartService) {}

  ngOnInit() {
    // sumowanie kosztu
    this.sumPrice = this.cartElements.reduce((a, b) => {
      return a + b.sumPrice;
    }, 0);

    // stworzenie listy produktów znajdujących sie w koszyku
    this.cartProducts = this.cartElements.map(item => {
      return item.name;
    });
  }

  removeItem(cartItem) {
    // jezeli klucz wybranego elementu bedzie sie zgadzal z kluczem produktu w koszyku to zostanie utworzon nowa list produktów nie zawierająca tego produktu o tym kluczu
    let newCartList = this.cartElements.filter(item => {
      return item.key !== cartItem.key;
    });
    this.cS.setToLocal("cartItems", newCartList);

    this.cartElements = this.cS.getFromLoacl("cartItems") || [];

    this.quantity = this.cS.getFromLoacl("cartItems");

    this.quantity = this.cartElements.reduce((a, b) => {
      return a + b.quantity;
    }, 0);

    this.cS.setToLocal("quantity", this.quantity);

    this.sumPrice = this.cartElements.reduce((a, b) => {
      return a + b.sumPrice;
    }, 0);

    this.cartProducts = this.cartElements.map(item => {
      return item.name;
    });
  }

  addQuan(itemQun) {
    // zwiekszanie ilości produktu w koszyku
    this.cartElements.filter(item => {
      if (item.id === itemQun.id) {
        item.quantity = item.quantity + 1;
        item.sumPrice = item.quantity * item.price;
        item.time = moment().format("LLL");
      }
    });

    this.sumPrice = this.cartElements.reduce((a, b) => {
      return a + b.sumPrice;
    }, 0);
    this.cS.setToLocal("cartItems", this.cartElements);

    this.quantity = this.cartElements.reduce((a, b) => {
      return a + b.quantity;
    }, 0);
    this.cS.setToLocal("quantity", this.quantity);
  }

  reduceQuan(itemQun) {
    this.cartElements.filter(item => {
      if (item.quantity <= 1) {
        // jeżeli quantity jest mniejsze bądź równe jeden to uruchamiana jest metoda remove item
        this.removeItem(itemQun);
      } else if (item.id === itemQun.id) {
        // jeżeli jest większa i id się zgadzaja quantity jest zmniejszane o 1, suma obliczana na nowo
        item.quantity = item.quantity - 1;
        item.sumPrice = item.quantity * item.price;
      }
    });

    this.sumPrice = this.cartElements.reduce((a, b) => {
      return a + b.sumPrice;
    }, 0);
    this.cS.setToLocal("cartItems", this.cartElements);

    this.quantity = this.cartElements.reduce((a, b) => {
      return a + b.quantity;
    }, 0);
    this.cS.setToLocal("quantity", this.quantity);
  }
}
