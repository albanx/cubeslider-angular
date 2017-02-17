import { Directive, Component, OnInit, AfterViewInit,AfterContentInit,
    Renderer, ViewChildren, ElementRef, ViewChild } from '@angular/core';

import {CarouselElement} from "./carousel-element";
import {CarouselImageDirective} from "./directives/carousel-image.directive";
import {CarouselItemDirective} from "./directives/carousel-item.directive";
import {DataService} from "../../services/data.service";
import Timer = NodeJS.Timer;

@Component({
    selector: 'app-carousel',
    templateUrl: 'carousel.component.html',
    styleUrls: ['carousel.component.scss']
})


export class CarouselComponent implements OnInit, AfterViewInit, AfterContentInit {

    //public props used in the template
    settings = {
        addShadow: false,
        navigation: false,
        showArrows: false,
        orientation: 'v',
        cubes: 4,
        random: false,
        perspective: 1200,
        autoplay: false,
        autoplayInterval: 2000,
        backfacesColor: 'green',
        animationSpeed: 800,
        easing: 'ease',
        cubeSync: 100
    };

    cubeOptions = {}

    currItem:number = 0;
    prevItem:number = 0;
    showArrows:boolean = false;
    showTitle:boolean = true;
    rows:number;
    cols:number;

    //private internal props
    width:number = 0;
    height:number = 0;
    renderWidth: number = 0;
    renderHeight: number = 0;

    private elements:CarouselElement[];
    private images;

    //run time vars
    private animating:boolean = false;
    private slideTimer:any;
    private debounceTimer: Timer;
    private resizeTime: number = 250;

    loading:boolean = true;
    rowsRange: number[];
    colsRange: number[];

    @ViewChildren(CarouselItemDirective) items;
    @ViewChildren(CarouselImageDirective) imagesQueryList;
    @ViewChild('slider') slider:ElementRef;
    @ViewChild('wrapper') wrapper:ElementRef;
    @ViewChild('nextArrow') nextArrow:ElementRef;
    @ViewChild('prevArrow') prevArrow:ElementRef;

    constructor(private _elRef:ElementRef, private _renderer:Renderer, private _data:DataService) {
    }

    /**
     * On Init start loading the image list from remote
     */
    ngOnInit() {
        this._data.getCarouselMockItems().then(
            data => {
                this.elements = data;
            },
            error => console.log(error)
        );
    }

    /**
     * Wait for the component to intialize and monitor images changes
     */
    ngAfterViewInit() {
        console.log('ngAfterViewInit');
        this.imagesQueryList.changes.subscribe(list => this._loadImage(list));
    }

    ngAfterContentInit() {
        console.log('ngAfterContentInit');
    }

    /**
     * Check image loading, once all iamges are loaded start the slider and remove the loader
     * @param list the images list directives
     * @private
     */
    private _loadImage( list: CarouselImageDirective[] ) {

        this.images = this.imagesQueryList.toArray();

        //from each directive get the loadImage promise and wait for them all to complete
        Promise.all( list.map(item => item.loadImage()) ).then(elementsRef => {
            this.loading = false;
            this._initSlider(elementsRef);
        });
    }

    /**
     * Start the slider and elaborates some DOM style changes
     * @param elementRefs the list of all elements
     * @private
     */
    private _initSlider(elementRefs) {

        //set the containers overflow and position
        this._renderer.setElementStyle(this.slider.nativeElement, 'overflow', 'visible');
        this._renderer.setElementStyle(this.wrapper.nativeElement, 'overflow', 'visible');
        this._renderer.setElementStyle(this.wrapper.nativeElement, 'position', 'relative');

        //set slider size based on the real image size
        this._setSize();

        //add shadow div
        this.settings.addShadow = true;

        //add navigation
        this._addNavigation();

        //add arrows
        this._toggleArrows(true);

        //set responsive actions
        // this._renderer.setElementStyle(this.slider.nativeElement, 'max-width', this.renderWidth + 'px');
        // this._renderer.setElementStyle(this.wrapper.nativeElement, 'max-width', this.renderWidth + 'px');
        //this._renderer.setElementStyle(this.slider.nativeElement, 'height', this.height + 'px');


        //start sliding
        this.startSlide();

        this._createCubes(0);
    }

    /**
     * set slider size based on the first image size
     * @param realSize: boolean
     * @private
     */
    private _setSize() {
        this.width = this.images[0].getRealWidth();
        this.height = this.images[0].getRealHeight();
        this.renderWidth = this.images[this.currItem].getWidth();
        this.renderHeight = this.images[this.currItem].getHeight();
    }

    startSlide() {
        if (this.settings.autoplay) {
            this.slideTimer = setTimeout(() => {
                this.slideTo(1, false);
            }, this.settings.autoplayInterval);
        }
    }


    private _createCubes(dir:number) {
        //set orientation to random if it is not set
        let orientation = this.settings.orientation;
        if (!this.settings.orientation) {
            orientation = Math.floor(Math.random() * 2) === 0 ? 'v' : 'h';
        }

        //set the number of cubes
        if (typeof(this.settings.cubes) == 'object') {
            this.rows = this.settings.cubes['rows'];
            this.cols = this.settings.cubes['cols'];
        }
        else {
            if (orientation == 'h') {
                this.rows = this.settings.cubes;
                this.cols = 1;
            }
            else {
                this.rows = 1;
                this.cols = this.settings.cubes;
            }
        }

        //if random change values
        if (this.settings.random) {
            this.rows = Math.floor(Math.random() * this.rows + 1);
            this.cols = Math.floor(Math.random() * this.cols + 1);
            orientation = Math.random() < 0.5 ? 'v' : 'h';
        }

        this._fixCubes();

        this._renderer.setElementStyle(this.slider.nativeElement, 'overflow', 'visible');

        this.cubeOptions = {
            width: this.renderWidth,
            height: this.renderHeight,
            orientation: orientation,
            images: this.images,
            rows: this.rows,
            cols: this.cols,
            dir: dir,
            settings: this.settings
        };

        this.rowsRange = this.createRange(this.rows);
        this.colsRange = this.createRange(this.cols);
    }


    private _addNavigation() {
        this.settings.navigation = true;
    }

    private _toggleArrows(val:boolean) {
        this.settings.showArrows = val;

    }


    cubeAnimationEnd(event) {
        console.log('cubeAnimationEnd', event);
        this._renderer.setElementStyle(this.slider.nativeElement, 'overflow', 'hidden');
        //me.showTitle(me.items.eq(me.currItem).css('display', 'block'));
        //me.onFinish();
        this.animating = false;
    }

    private _fixCubes() {//filter settings and set the correct values
        this.rows = this.rows % 2 === 0 ? this.rows++ : this.rows;
        this.cols = this.cols % 2 === 0 ? this.cols++ : this.cols;
    }

    slideTo(dir:number, index:any) {
        if (!this.animating) {
            this.animating = true;

            this.prevItem = this.currItem;
            this.currItem += dir;

            if (this.currItem > this.items.length - 1) {
                this.currItem = 0;
            }

            if (this.currItem < 0) {
                this.currItem = this.items.length - 1;
            }

            if (index) {
                this.currItem = index;
            }

            this.showTitle = false;

            //TODO normal slide
            this._createCubes(dir);
        }
    }

    onResize() {
        if( !this.debounceTimer ) {
            this.debounceTimer = setTimeout(() => {
                this._setSize();
                this.debounceTimer = null;
            }, this.resizeTime);
        }
    }

    /**
     * Click the next arrow
     */
    onClickNextNav() {
        this.slideTo(1, false);
    }

    /**
     * Click the prev arrow
     */
    onClickPrevNav() {
        this.slideTo(-1, false);
    }

    /**
     * Slide the slider when clicking on the navigation buttons
     * @param index the index of the current slide to show
     */
    onNavClick(index: number) {
        this.slideTo(index - this.currItem, index);
    }


    /**
     * This is a helper function for simulating a classic for-loop in Angular 2 templates
     * @param number the loop number
     * @returns {number[]} an array of numbers to loop with ngFor
     */
    createRange(number: number) {
        var items:number[] = [];
        for (var i = 1; i <= number; i++) {
            items.push(i);
        }
        return items;
    }

}
