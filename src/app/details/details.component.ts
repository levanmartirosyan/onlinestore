import { HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToolsService } from '../services/tools.service';
import e from 'express';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss',
})
export class DetailsComponent implements OnInit {
  constructor(
    public actR: ActivatedRoute,
    public apiService: ApiService,
    public tools: ToolsService
  ) {}

  ngOnInit(): void {
    this.getCardDetails();
    this.getCartForCheck();
    this.getqoutes();
  }

  public productDetails: any;
  public productDetailsImages: any[] = [];
  public saledGanvadebaCurrent: any;
  public saledGanvadebaBefore: any;
  public dateOfProducts: any;

  getCardDetails() {
    this.actR.queryParams.subscribe((data: any) => {
      this.productDetails = JSON.parse(data.data);
      this.saledGanvadebaCurrent =
        Math.round((this.productDetails.price.current / 12) * 10) / 10;
      this.saledGanvadebaBefore =
        Math.round((this.productDetails.price.beforeDiscount / 12) * 10) / 10;
      this.productDetails.images.forEach((images: any) => {
        this.productDetailsImages.push(images);
      });
      this.dateOfProducts = this.productDetails.issueDate.slice(0, 10);
    });
  }
  copyLink() {
    const currentUrl = window.location.href; // Get current URL
    navigator.clipboard
      .writeText(currentUrl)
      .then(() => {
        this.tools.showSuccess('ლინკი დაკოპირდა', 'წარმატება!');
      })
      .catch(() => {
        this.tools.showError('ლინკი ვერ დაკოპირდა', 'შეცდომა!');
      });
  }

  public currentIndex = 0;

  next() {
    this.currentIndex =
      (this.currentIndex + 1) % this.productDetailsImages.length;
  }

  prev() {
    this.currentIndex =
      (this.currentIndex - 1 + this.productDetailsImages.length) %
      this.productDetailsImages.length;
  }

  giveIndex(id: any) {
    this.currentIndex = id;
  }
  public checkCart: any;

  createCart(id: any) {
    const getToken = sessionStorage.getItem('userToken');
    if (!getToken) {
      this.tools.showWarning('ჯერ გაიარეთ ავტორიზაცია', 'ყურადღება!');
      return;
    }
    const userData = new HttpHeaders({
      accept: 'application/json',
      'Content-Type': 'application/json',
    });
    const body = JSON.stringify({
      id: id,
      quantity: 1,
    });
    this.apiService.addCreateProductsCart(userData, body).subscribe({
      next: (data: any) => {
        this.tools.showSuccess('პროდუქტი კალათაში დაემატა', 'წარმატება!');
      },
      error: (error) => {
        this.tools.showError(error.error.error, 'შეცდომა!');
      },
    });
  }

  addToCart(id: any) {
    const getToken = sessionStorage.getItem('userToken');
    if (!getToken) {
      this.tools.showWarning('ჯერ გაიარეთ ავტორიზაცია', 'ყურადღება!');
      return;
    }
    const userData = new HttpHeaders({
      accept: 'application/json',
      'Content-Type': 'application/json',
    });
    const body = JSON.stringify({
      id: id,
      quantity: 1,
    });
    this.apiService.addProductsToCart(userData, body).subscribe({
      next: (data: any) => {
        this.tools.showSuccess('პროდუქტი კალათაში დაემატა', 'წარმატება!');
      },
      error: (error) => {
        this.tools.showError(error.error.error, 'შეცდომა!');
      },
    });
  }

  getCartForCheck() {
    const getToken = sessionStorage.getItem('userToken');
    if (!getToken) {
      console.log('User not logged in.');
      return;
    }
    const userData = new HttpHeaders({
      accept: 'application/json',
      'Content-Type': 'application/json',
    });
    this.apiService.getCartProducts(userData).subscribe({
      next: (data: any) => {
        this.checkCart = data;
      },
      error: (error) => {},
    });
  }

  public rateWindow: boolean = false;

  openRateWindow() {
    this.rateWindow = !this.rateWindow;
  }

  public productRate: FormGroup = new FormGroup({
    rate: new FormControl('', [
      Validators.required,
      Validators.min(1),
      Validators.max(5),
    ]),
  });

  sendProductRate(id: any) {
    const getToken = sessionStorage.getItem('userToken');
    if (!getToken) {
      this.tools.showWarning('ჯერ გაიარეთ ავტორიზაცია', 'ყურადღება!');
      return;
    }
    const userData = new HttpHeaders({
      accept: 'application/json',
      'Content-Type': 'application/json',
    });
    const body = {
      productId: id,
      rate: this.productRate.value.rate,
    };
    this.apiService.productRate(userData, body).subscribe({
      next: (data: any) => {
        this.tools.showSuccess('შეფასება გაიგზავნა', 'წარმატება!');
        this.openRateWindow();
      },
      error: (error: any) => {
        this.tools.showError(error.error.error, 'შეცდომა!');
      },
    });
  }

  public randomQoutes: any;
  public randomPage: any;
  public randomSize: any;

  randomNums() {
    this.randomPage = Math.floor(Math.random() * 13) + 1;
    this.randomSize = Math.floor(Math.random() * 6) + 7;
  }
  getqoutes() {
    this.randomNums();
    this.apiService
      .getReviewsRandom(this.randomPage, this.randomSize)
      .subscribe({
        next: (data: any) => {
          this.randomQoutes = data.quotes;
        },
        error: (error: any) => {
          console.log(error);
        },
      });
  }
}
