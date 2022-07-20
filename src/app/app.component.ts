import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
declare let ml5: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = "dl";
  started = false;
  errString = "";
  @ViewChild('webcam')
  webcam!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas')
  canvas!: ElementRef<HTMLCanvasElement>;

  detectionOptions = {
    withLandmarks: true,
    withDescriptors: true,
    minConfidence: 0.1
  };
  faceApi = ml5.faceApi(this.detectionOptions, this.modelLoaded);

  ngAfterViewInit(): void {
    this.webcam.nativeElement.width = window.innerWidth * 0.8 ;
    this.webcam.nativeElement.height = window.innerWidth * 0.8 * 3 / 4;
    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then( (stream) => {
          this.webcam.nativeElement.srcObject = stream;
          this.webcam.nativeElement.play();
        })
        .catch(function (err) {
          console.log("Something went wrong!");
        });
    }
  }

  drawImage(box?: any, score?: number) {
    console.log("HERE")
    let ctx = this.canvas.nativeElement.getContext('2d');
    let width = this.webcam.nativeElement.width;
    let height = this.webcam.nativeElement.height;
    this.canvas.nativeElement.width = this.webcam.nativeElement.width;
    this.canvas.nativeElement.height = this.webcam.nativeElement.height;

    ctx?.drawImage(this.webcam.nativeElement, 0, 0, width, height);
    if(box && score) {
      ctx?.rect(box.x, box.y, box.width, box.height);
      ctx!.lineWidth = 6;
      ctx!.strokeStyle = "red";
      ctx!.font = "bold 40px Helvetica Neue";
      ctx!.fillStyle = "red";
      ctx?.fillText(score.toString().substring(0, 4), box.x + 60, box.y + 60);
      ctx?.stroke();
    }
  }

  modelLoaded() {
    console.log('Model loaded!');
  }

  detect() {
    this.faceApi.detect(this.webcam.nativeElement, (_err: any, _res: any) => {
      if(_err) {
        this.errString = "Something went wrong!"
        this.drawImage();
        this.detect();
      } else this.errString = "";
      if(!_err && _res) {
        console.log(_res);
        let box = _res[0].alignedRect._box;
        let score = _res[0].detection.score;
        this.drawImage(box, score);
        this.detect();
      }
    });
  }



}
