import { CartService } from "./../cart.service";
import { HttpClient } from "@angular/common/http";
import * as moment from "moment";
import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  HostListener
} from "@angular/core";
import { element } from "@angular/core/src/render3";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"]
})
export class HomeComponent {
  @ViewChild("stickyMenu") menuElement: ElementRef;
  data; // dane wyswitlane na ekranie
  cart; // elementy w koszyku
  quantity = this.cS.getFromLoacl("quantity");
  sticky: boolean = false;
  menuPosition: any;

  constructor(private http: HttpClient, private cS: CartService) {}

  ngOnInit() {
    // pobranie zawartosci koszyka
    this.cart = this.cS.getFromLoacl("cartItems") || [];

    // pobranie danych
    this.http
      .get(
        "https://cors-anywhere.herokuapp.com/http://shoppingcartapi.hire.inwedo.com/items"
      )
      .subscribe(resoponse => {
        this.data = resoponse;
        sessionStorage.setItem("dataStorage", JSON.stringify(this.data));
      });
  }
  // sticky menu
  @HostListener("window:scroll", ["$event"])
  handleScroll() {
    const windowScroll = window.pageYOffset;
    if (windowScroll >= this.menuPosition) {
      this.sticky = true;
    } else {
      this.sticky = false;
    }
  }
  ngAfterViewInit() {
    this.menuPosition = this.menuElement.nativeElement.offsetTop;
  }

  ngAfterContentChecked() {
    if (!this.data.hasOwnProperty("quantity")) {
      this.data.forEach(element => {
        this.cart.forEach(element1 => {
          if (element.id === element1.id) element.quantity = element1.quantity;
        });
      });
    }
  }

  // sprawdzenie czy koszyk jest pusty, jezeli tak to link jest pusty
  checkCart() {
    if (this.cart === null) {
      return true;
    }
  }

  // otrzymanie informacji o obiekcie który został wybrany
  addItem(data: any) {
    // po wcisnieciu klawisza obiekt otrzymuje nową właściwość quantity równą 1
    data.quantity = 1;

    if (data.quantity === 1) {
      data.sumPrice = data.price;
    }
    // dodanie klucza
    data.key = Math.round(Math.random() * 10000);
    //dodanie daty dodania produktu
    data.time = moment().format("LLL");
    // pobranie wartosci z sessionStorage przy pomocy metody getFromLocal zdefiniowanej w CartServis
    this.cart = this.cS.getFromLoacl("cartItems") || [];
    // sprawdzenie czy w koszyku znajduje się już takie id
    if (this.cart.some(item => item.id === data.id)) {
      // gdy id się zgadza dodawane są wartości
      this.cart.filter(item => {
        if (item.id === data.id) {
          item.quantity = item.quantity + 1;
          item.sumPrice = item.quantity * item.price;
          // aktualizacja ilości dodanego produktu
          data.quantity = item.quantity;
        }
      });
    } else {
      // dodanie obiektu, którego jeszcze nie ma w koszyku
      this.cart.push(data);
    }
    // zapisanie obiektu w sessionStorrage
    this.cS.setToLocal("cartItems", this.cart);
    // sumowanie liczby dodanych produktów
    this.quantity = this.cart.reduce((a, b) => {
      return a + b.quantity;
    }, 0);
    // dodanie do sessionStorage
    this.cS.setToLocal("quantity", this.quantity);
  }

  decreaseQuantitiy(dataItem) {
    if (dataItem.quantity < 1) {
      alert("Nie ma już tego produktu w Twoim koszyku.");
    } else {
      this.cart.filter(item => {
        //porownianie elementu usuwanego z elementami znajdujacymi sie w koszyku
        if (item.id === dataItem.id) {
          //sprawdznie czy element w koszyku o wybranym id ma właściwość quantity, jeżei nie to ustaw 0
          if (!item.hasOwnProperty("quantity")) {
            item.quantity = 0;
          } else {
            // jezeli tak, to -1 od aktualnej wartości
            item.quantity = item.quantity - 1;
            this.data.filter(item2 => {
              if (item2.id === item.id) {
                // przypisanie nowej wartosci do obiektu data tak aby mogla zostać ona wyswietlona
                item2.quantity = item.quantity;
                // policzenie kosztu za wszysykie sztuki wybranego elementu
                item.sumPrice = item.quantity * item.price;
                this.cS.setToLocal("cartItems", this.cart);
              }
            });
          }
        }
      });
      // sumowanie wszystkich sztuk w koszyku
      this.quantity = this.cart.reduce((a, b) => {
        return a + b.quantity;
      }, 0);
      this.cS.setToLocal("quantity", this.quantity);
    }
  }
}
