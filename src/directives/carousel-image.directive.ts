import { Directive } from '@angular/core';
import {ElementRef} from "@angular/core";

@Directive({
    selector: '[carouselImage]',
    host: {
        '(load)': 'onImageLoad()'
    }
})

/**
 * Simple Image Directive components that detects Image loading and provides basic methods,
 * getWidth, get Height.
 */
export class CarouselImageDirective {
    private _loaded:boolean = false;
    private _resolve;

    constructor(private _elRef:ElementRef) {

    }

    getWidth():number {
        console.log('getWidth', this._elRef.nativeElement.width);
        return this._elRef.nativeElement.width;
    }


    getHeight():number {
        return this._elRef.nativeElement.height;
    }

    getRealWidth():number {
        return this._elRef.nativeElement.naturalWidth;
    }


    getRealHeight():number {
        return this._elRef.nativeElement.naturalHeight;
    }

    loadImage() {
        return new Promise<ElementRef>(resolve => this._resolve = resolve);
    }

    onImageLoad() {
        this._resolve(this._elRef);
        this._loaded = true;
    }

    getSrc(): string {
        return this._elRef.nativeElement.src;
    }

    getElement(): ElementRef {
        return this._elRef.nativeElement;
    }
}
