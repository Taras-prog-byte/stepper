import { Component } from '@angular/core';
import {StepperItem} from "./models/stepper.interface";
import {StepperDirection} from "./constants/stepper-direction.contant";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public stepsItems: StepperItem[] = [
    {
      label: 'Role'
    },
    {
      label: 'Email'
    },
    {
      label: 'Settings'
    },
    {
      label: 'Role'
    },
    {
      label: 'Email'
    },
    {
      label: 'Settings'
    },
  ]
  public currentFirstStep: StepperItem = {label: 'Email'};
  public currentSecondStep: StepperItem = {label: 'Email'};
  public currentThirdStep: StepperItem = {label: 'Email'};
  public readonly StepperDirection: typeof StepperDirection = StepperDirection;

  public firstStepperChange(step: StepperItem): void {
    this.currentFirstStep = step;
  }
  public secondStepperChange(step: StepperItem): void {
    this.currentSecondStep = step;
  }
  public thirdStepperChange(step: StepperItem): void {
    this.currentThirdStep = step;
  }
}
