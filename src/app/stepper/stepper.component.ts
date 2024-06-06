import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import {StepperItem, StepperItemWithIndex} from "../models/stepper.interface";
import {StepperDirection} from "../constants/stepper-direction.contant";
import {animate, state, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss'],
  animations: [
    trigger('setActive', [
      state('active', style({
        transform: 'translateX(0%)'
      })),
      state('inactive', style({
        transform: 'translateX({{ endTransformPos }})'
      }), { params: { endTransformPos: '-100%' }}),
      transition('inactive => active', [
        animate('300ms ease-out')
      ])
    ]),
    trigger('setInactive', [
      state('active', style({
        transform: 'translateX(0%)'
      })),
      state('inactive', style({
        transform: 'translateX({{ endTransformPos }})'
      }), { params: { endTransformPos: '100%' }}),
      transition('active => inactive', [
        animate('300ms ease-in')
      ]),
    ]),
  ]
})
export class StepperComponent implements OnChanges, OnInit, AfterViewInit {
  @Input() public steps: ReadonlyArray<StepperItemWithIndex> = [];
  @Input() public direction: StepperDirection = StepperDirection.Horizontal;
  @Input() public currentStep: StepperItemWithIndex;

  @Output() public stepChange: EventEmitter<StepperItem> = new EventEmitter<StepperItem>();

  public readonly StepperDirection: typeof StepperDirection = StepperDirection;
  public readonly uniqId: number = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  public currentStepIndex: number;
  public windowWidth: number;
  public animationParams = {activeStartAnim: '100%', inactiveStartAnim: '100%'};
  public underlineStyles = { left: 0, width: 0 };

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.windowWidth = window.innerWidth;
    this.setActive(this.currentStepIndex, this.activeStepElement);
  }

  constructor(private cdr: ChangeDetectorRef) {}

  public ngOnInit(): void{
    this.windowWidth = window.innerWidth;

    //adding indexes for steps for better animation logic
    this.steps = this.steps.map((step: StepperItem, index: number)  => {
      return {
        label: step.label,
        index,
      }
    })
  }

  public ngOnChanges(changes:SimpleChanges): void {
    if(!changes['currentStep'] || !changes['currentStep'].currentValue){
      throw new Error('Field "currentStep" is required!')
    } else if (changes['currentStep'].currentValue) {
      //check if value with duplicated name selected
      if(changes['currentStep'].currentValue.index){
        this.setActive(changes['currentStep'].currentValue.index, this.activeStepElement, true);
      } else {
        //calculate selected element index by label
        this.calculateCurrentStepIndex(changes['currentStep'].currentValue);
        this.setActive(this.currentStepIndex, this.activeStepElement, true);
      }
    }
  }

  public ngAfterViewInit(): void {
    if(this.steps.length){
      if(this.currentStepIndex && this.currentStepIndex !== -1){
        //set active tab if it is present on component initialisation
        this.setActive(this.currentStepIndex, this.activeStepElement);
      } else {
        this.setFirstStep();
      }
    }
  }

  //function to set active tab and calculation animation params
  public setActive(index: number, element: HTMLElement, skipEventEmitting?: boolean) {
    if(!element) return;

    this.calculateAnimationParams(index);

    const rect = element.getBoundingClientRect();
    const parentRect = element.parentElement!.getBoundingClientRect();

    this.underlineStyles = {
      left: rect.left - parentRect.left,
      width: rect.width
    };

    this.currentStepIndex = index;
    this.cdr.detectChanges();

    //skip emitting data to parent component to avoid loop (for ex on onChanges lifecycle hook
    if(!skipEventEmitting){
      this.stepChange.emit(this.steps[index]);
    }
  }

  private calculateAnimationParams(index: number): void {
    //dynamically calculate animation params for vertical view mode
    if(index < this.currentStepIndex){
      this.animationParams.activeStartAnim = '100%';
      this.animationParams.inactiveStartAnim = '-100%';
    }
    if(index > this.currentStepIndex){
      this.animationParams.activeStartAnim = '-100%';
      this.animationParams.inactiveStartAnim = '100%';
    }
    this.cdr.detectChanges();
  }

  private calculateCurrentStepIndex(step: StepperItem): void {
    this.currentStepIndex = this.getCurrentStepIndex(step);
    this.cdr.detectChanges();
  }

  private get activeStepElement(): HTMLElement {
    //get active element to apply animation to it
    const parentElement = document.getElementById(this.uniqId.toString())
    return  parentElement!.querySelector('.active') as HTMLElement
  }

  private getCurrentStepIndex(step: StepperItem): number {
    //search for element index by label
    return this.steps.findIndex(stepItem => stepItem.label === step.label);
  }

  private setFirstStep(): void {
    //set first step from arr of steps
    this.calculateCurrentStepIndex(this.steps[0]);
    this.setActive(this.getCurrentStepIndex(this.steps[0]), this.activeStepElement);
  }
}
