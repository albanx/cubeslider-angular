import {NgModule} from '@angular/core';
import {HttpModule, Http} from '@angular/http';
import {BrowserModule} from '@angular/platform-browser';
import {CommonModule} from '@angular/common';
import {DataService} from "../../services/data.service";
import {TranslateService} from "../../services/translate.service";
import {CarouselComponent} from "./carousel.component";
import {CubeComponent} from "./cube/cube.component";
import {CarouselImageDirective} from "./directives/carousel-image.directive";
import {CarouselItemDirective} from "./directives/carousel-item.directive";

@NgModule({
    //add components/pipes we want to use in our application
    declarations: [
        CarouselComponent,
        CubeComponent,
        CarouselImageDirective,
        CarouselItemDirective
    ],
    //import finished modules
    imports: [
        BrowserModule,
        CommonModule,
        HttpModule,
    ],
    exports:      [ CarouselComponent ],
    providers: [
        DataService,
        TranslateService
    ]
})


export class CarouselModule {

}
