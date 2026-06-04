import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueLogComponent } from './issue-log.component';

describe('IssueLogComponent', () => {
  let component: IssueLogComponent;
  let fixture: ComponentFixture<IssueLogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IssueLogComponent]
    });
    fixture = TestBed.createComponent(IssueLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
