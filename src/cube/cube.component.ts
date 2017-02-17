import { Directive, Component,OnDestroy, OnInit, AfterViewInit,
    Renderer, AfterContentInit,Input } from '@angular/core';
import {DomSanitizer  } from "@angular/platform-browser/src/security/dom_sanitization_service";
import {ElementRef, ViewChild, Output, EventEmitter} from "@angular/core";

@Component({
    selector: 'carousel-cube',
    templateUrl: 'cube.component.html',
    styleUrls: ['cube.component.scss'],
    inputs: ['row', 'col', 'options', 'pos', 'animate'],
    host: {
        '(transitionend)': 'onTransitionEnd()'
    }
})

export class CubeComponent implements OnInit, OnDestroy {

    row:number;
    col:number;
    pos: number;
    options;
    animate:boolean;

    dir:number;
    images;
    face:number;

    width:number;
    height:number;
    stageWidth:number;
    stageHeight:number;
    gapw:number;
    gaph:number;
    settings;
    rows:number;
    cols:number;
    orientation:string;
    x:number;
    y:number;
    showFace:any;
    currentFace: any;
    faceStyles:any;
    spreadPixel:number;

    private callback: any;

    //cube props
    zIndex: number;
    transitionProp: string;

    @ViewChild('cube') cube:ElementRef;
    @ViewChild('face0') face0:ElementRef;
    @ViewChild('face1') face1:ElementRef;
    @ViewChild('face2') face2:ElementRef;
    @ViewChild('face3') face3:ElementRef;
    @ViewChild('face4') face4:ElementRef;
    @ViewChild('face5') face5:ElementRef;
    @Output() animationEnd = new EventEmitter();
    @Input() currItem: number = 0;
    @Input() prevItem: number = 0;

    //private var to detect if divs have been rendered on the DOM
    //private _isReady = false;

    constructor(private sanitizer:DomSanitizer  , private _renderer:Renderer) {
        console.log('CUBE::constructor');
    }

    ngOnInit() {
        this.settings = this.options.settings;
        this.orientation = this.options.orientation;
        this.rows = this.options.rows;
        this.cols = this.options.cols;
        this.stageWidth = this.options.width;
        this.stageHeight = this.options.height;
        this.dir = this.options.dir;
        this.images = this.options.images;
        this.face = 1;

        this._setSize(this.row, this.col);
        this._setStyle();
        this._createCube(this.prevItem);
        this.rotate(this.currItem, null);
    }

    //ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    //    for (let propName in changes) {
    //        let changedProp = changes[propName];
    //
    //
    //        if(propName === 'rotateCubesToIndex' && this._isReady) {
    //            this.rotate(changedProp.currentValue, null);
    //        }
    //    }
    //}

    //ngAfterViewInit() {
    //    this._isReady = true;
    //
    //    console.log("ngAfterViewInit::Cube view ready");
    //}
    //
    //ngAfterContentInit() {
    //    // do something with list items
    //    console.log("ngAfterContentInit::Cube view ready");
    //
    //}

    private _setSize(row:number, col:number) {
        this.width = Math.floor(this.stageWidth / this.cols);
        this.height = Math.floor(this.stageHeight / this.rows);
        this.gapw = this.stageWidth - ( this.width * this.cols );
        this.gaph = this.stageHeight - ( this.height * this.rows );

        this.y = this.height * row;
        this.x = this.width * col;
    }

    private _setStyle() {
        // style for the slice
        let settings = this.settings;
        let halfw = this.width / 2;
        let halfh = this.height / 2;
        let rotate_axis = 'X';
        let hw = halfh;
        let rotZ = 'rotateZ( 180deg )', topx = 0, leftx = 0, facedim = this.width;
        if (this.orientation === 'v') {
            hw = halfh;
            leftx = (halfw - halfh);
            rotate_axis = 'X';
            facedim = this.height;
        }
        else {
            hw = halfw;
            rotZ = '';
            topx = (halfh - halfw);
            rotate_axis = 'Y';
            facedim = this.width;
        }

        var front = {};
        var back = {};
        var right = {};
        var left = {};
        var top = {};
        var bottom = {};


        //common style for all faces
        front['backgroundSize'] = this.stageWidth + 'px ' + this.stageHeight + 'px';
        front['backgroundPosition'] =  '-' + this.x + 'px -' + this.y + 'px';

        front['width'] = this.width + this.gapw;
        front['height'] = this.height + this.gaph;
        front['backgroundColor'] = settings.backfacesColor;
        front['transform'] = 'rotate3d( 0, 1, 0, 0deg ) translate3d( 0px, 0px, ' + hw + 'px )';
        front['transform'] = this.sanitizer.bypassSecurityTrustStyle(front['transform']);

        back['width'] = this.width;
        back['height'] = this.height;
        back['backgroundColor'] = settings.backfacesColor;
        back['transform'] = 'rotate3d( 0, 1, 0, 180deg ) translate3d( 0px, 0px, ' + hw + 'px ) ' + rotZ;
        back['transform'] = this.sanitizer.bypassSecurityTrustStyle(back['transform']);

        right['width'] = facedim;
        right['height'] = this.height + this.gaph;
        right['background-color'] = settings.backfacesColor;
        right['transform'] = 'rotate3d( 0, 1, 0, 90deg ) translate3d( 0px, 0px, ' + halfw + 'px )';
        right['left'] = leftx;
        right['transform'] = this.sanitizer.bypassSecurityTrustStyle(right['transform']);

        left['width'] = facedim;
        left['height'] = this.height + this.gaph;
        left['backgroundColor'] = settings.backfacesColor;
        left['transform'] = 'rotate3d( 0, 1, 0, -90deg ) translate3d( 0px, 0px, ' + halfw + 'px )';
        left['transform'] = this.sanitizer.bypassSecurityTrustStyle(left['transform']);
        left['left'] = leftx;

        top['width'] = this.width + this.gapw;
        top['height'] = facedim;
        top['backgroundColor'] = settings.backfacesColor;
        top['transform'] = 'rotate3d( 1, 0, 0, 90deg ) translate3d( 0px, 0px, ' + halfh + 'px )';
        top['transform'] = this.sanitizer.bypassSecurityTrustStyle(top['transform']);
        top['top'] = topx;

        bottom['width'] = this.width + this.gapw;
        bottom['height'] = facedim;
        bottom['backgroundColor'] = settings.backfacesColor;
        bottom['transform'] = 'rotate3d( 1, 0, 0, -90deg ) translate3d( 0px, 0px, ' + halfh + 'px )';
        bottom['transform'] = this.sanitizer.bypassSecurityTrustStyle(bottom['transform']);
        bottom['top'] = topx;

        this.faceStyles = {front: front, back: back, left: left, right: right, top: top, bottom: bottom};

        //face of cube to show, we show always 4 of 6 faces of the cube
        this.showFace = [
            this.sanitizer.bypassSecurityTrustStyle('translateZ(-' + hw + 'px )'),
            this.sanitizer.bypassSecurityTrustStyle('translateZ(-' + hw + 'px ) rotate' + rotate_axis + '(-90deg )'),
            this.sanitizer.bypassSecurityTrustStyle('translateZ(-' + hw + 'px ) rotate' + rotate_axis + '(-180deg )'),
            this.sanitizer.bypassSecurityTrustStyle('translateZ(-' + hw + 'px ) rotate' + rotate_axis + '(-270deg )')
        ];
    }

    /**
     * Set the cube style, order, calculate transition and set the corret image
     * @param index the index of the image to show
     * @private
     */
    private _createCube(index:number) {
        let half_r = Math.ceil(this.rows / 2);
        var half_c = Math.ceil(this.cols / 2);

        //cube position
        var r_z = (this.row < half_r) ? (this.row + 1) : (this.rows - this.row);
        var c_z = (this.col < half_c) ? (this.col + 1) : (this.cols - this.col);

        //the face to show with transition
        this.currentFace = this.showFace[0];

        //order if this cube
        this.zIndex = (r_z + c_z) * 100;

        //animation duration and easing
        this.transitionProp = 'transform ' + this.settings.animationSpeed + 'ms ' + this.settings.easing;

        //change for the next image
        this._changeImage(index);

        //calculate the spread size
        this.spreadPixel = this.settings.spreadPixel*((this.col+this.row + 2) - half_c-half_r);
    }

    private _changeImage(index:number) {
        let face: ElementRef;
        switch (this.face) {
            case 1:
                face = this.face0;
                break;//never goes
            case 2:
                face = (this.orientation === 'v') ? this.face4 : this.face2;
                break;
            case 3:
                face = this.face1;
                break;//never goes
            case 4:
                face = (this.orientation === 'v') ? this.face5 : this.face3;
                break;
        }

        this._renderer.setElementStyle(face.nativeElement, 'background-image', 'url(' + this.images[index].getSrc() +')');
    }

    rotate(currentIndex:number, callback:any) {

        console.log('rotate');
        this.callback = callback;
        setTimeout(() => {
            //calculate the face to show on rotate
            //var face2show =  Math.max(Math.min(4, currCube.face + currCube.dir), 2);
            let face2show =  this.dir > 0 ? 2 : 4;

            this.face = face2show;//store current face shown

            //change the face, and cube will start animating
            this.currentFace = this.showFace[face2show-1];

            //switch the image
            this._changeImage(currentIndex);

            console.log('face to show ', this.currentFace);
            //var startMove = {}, endMove = {};
            //
            //if (this.orientation === 'v')
            //{
            //    startMove.left 	= '+=' + currCube.spreadPixel + 'px';
            //    endMove.left 	= '-=' + currCube.spreadPixel + 'px';
            //}
            //else if (this.orientation === 'h')
            //{
            //    startMove.top 	= '+=' + this.spreadPixel + 'px';
            //    endMove.top 	= '-=' + this.spreadPixel + 'px';
            //}

            //run animation
            //this.cube.css('transform', transformCss).animate(startMove, this.settings.animationSpeed / 2 ).animate(endMove, settings.animationSpeed / 2 , function() {
            //
            //});

        }, this.settings.cubeSync * this.pos);
    }

    onTransitionEnd() {
        if(this.rows*this.cols === (this.pos+1) ) {
            this.animationEnd.emit({
                pos: this.pos
            });
        }

        console.log('transition ended');
        //if(typeof this.callback === 'function') {
        //    this.callback.call(this, this.pos);
        //}
    }

    ngOnDestroy() {
        console.log('Destroy cube');
    }
}
