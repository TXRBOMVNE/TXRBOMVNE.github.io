import { animate, style, transition, trigger } from '@angular/animations';
import { AfterViewChecked, AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { findIndex, Subscription, take } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Tab, TabGroup } from 'src/app/models/song.model';
import { EditTabService } from '../edit-tab/edit-tab.service';
import { PlayerService } from '../player.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  animations: [
    trigger('appear', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('150ms ease-in-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('150ms ease-in-out', style({ opacity: 0 }))
      ])
    ]),
    trigger('appear2', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('150ms 500ms ease-in-out', style({ opacity: 1 }))
      ])
    ]),
    trigger('enterFromSide', [
      transition(':enter', [
        style({ transform: 'translateX(-150%)' }),
        animate('150ms ease-in-out', style({ transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in-out', style({ transform: 'translateX(-150%)' }))
      ])
    ])
  ]
})

export class SidebarComponent implements OnInit, OnChanges, OnDestroy, AfterViewChecked, AfterViewInit {

  constructor(
    private fireAuth: AngularFireAuth,
    private authService: AuthService,
    private playerService: PlayerService,
    private editTabService: EditTabService) { }

  // Gets element which contains the instruments icons
  @ViewChild('instruments') container?: ElementRef<HTMLDivElement>
  @Input() menuStatus: boolean = false
  @Output() menuStatusOutput = new EventEmitter<boolean>()

  isMenuActive: boolean = false
  showSearchMenu: boolean = false
  showSelectionModal: boolean = false
  imageSrc?: string
  subs?: Subscription[]
  editMode: boolean = false
  currentTab?: Tab
  currentTabGroup?: TabGroup
  HTMLIconCollection: HTMLDivElement[] = []
  loaded: number[] = []
  tabIndex?: number

  ngOnInit() {
    this.fireAuth.onAuthStateChanged(user => this.imageSrc = user?.photoURL!)
    const editModeSub = this.playerService.editMode.subscribe(value => {
      this.editMode = value
      if (!value) {
        this.loaded.splice(this.loaded.findIndex(i => i === this.tabIndex), 1)
      }
    })
    const currentTabGroupSub = this.playerService.currentTabGroup.subscribe(tabGroup => {
      if (this.currentTabGroup !== tabGroup) {
        this.loaded = []
      }
      this.currentTabGroup = tabGroup!
      if (this.HTMLIconCollection.length === 0) return
      this.getCollection()
      this.HTMLIconCollection.forEach(div => div.classList.remove('active-instrument'))
      this.HTMLIconCollection[this.playerService.currentTabIndex.value!].classList.add('active-instrument')
    })
    const currentUserSub = this.fireAuth.user.subscribe(user => {
      if (!user) {
        this.authService.logOut()
      }
    })
    this.subs?.push(editModeSub, currentUserSub, currentTabGroupSub)
  }

  ngAfterViewInit(): void {
    this.playerService.currentTab.pipe(take(1)).subscribe(tab => {
      if (!tab) return
      this.getCollection()
      this.HTMLIconCollection[this.playerService.currentTabIndex.value!].classList.add('active-instrument')
      this.tabIndex = this.playerService.currentTabIndex.value!
    })
    setTimeout(() => {
      if (!this.imageSrc) {
        this.imageSrc = 'https://firebasestorage.googleapis.com/v0/b/tab-player.appspot.com/o/default_profile.png?alt=media&token=631da581-8c28-4504-88ae-207b61e334b4'
      }
    }, 2500)
  }

  ngAfterViewChecked(): void {
    this.detectOverflow()
  }

  ngOnChanges(changes: SimpleChanges) {
    this.isMenuActive = changes['menuStatus'].currentValue
  }

  ngOnDestroy() {
    this.subs?.forEach(sub => sub.unsubscribe())
  }

  closeMenu() {
    this.isMenuActive = false
    this.menuStatusOutput.emit(this.isMenuActive)
  }

  closeSearchMenu() {
    this.showSearchMenu = false
  }

  load(index: number) {
    this.loaded.push(index)
    this.detectOverflow()
  }

  isLoaded(index: number): boolean {
    const test = this.loaded.find(el => el === index)
    if (!test && test !== 0) {
      return false
    }
    return true
  }

  // Listens for resizing and adds class if the instruments icons container is overflowing
  @HostListener('window:resize', ['$event'])
  detectOverflow() {
    function isOverflown(element: HTMLDivElement) {
      return element.scrollHeight > element.clientHeight;
    }
    if (this.container && isOverflown(this.container?.nativeElement!)) {
      this.container.nativeElement.classList.add('overflow')
    } else {
      this.container?.nativeElement.classList.remove('overflow')
    }
  }

  changeTab(index: number) {
    if (index === -1 || index === this.playerService.currentTabIndex.value) return
    if (this.editMode) {
      this.loaded.splice(this.loaded.findIndex(i => i === this.tabIndex), 1)
    }
    this.editTabService.modifyTab.next(null)
    this.playerService.changeTab(index)
    this.HTMLIconCollection.forEach(div => div.classList.remove('active-instrument'))
    this.HTMLIconCollection[this.playerService.currentTabIndex.value!].classList.add('active-instrument')
    this.tabIndex = index
  }

  instrumentForm = new FormGroup({
    name: new FormControl('guitar', Validators.required),
    strings: new FormControl(6, Validators.required)
  })

  addInstrument(event: MouseEvent) {
    this.loaded.splice(this.loaded.findIndex(i => i === this.tabIndex), 1)
    this.editTabService.modifyTab.next(null)
    event.preventDefault()
    this.playerService.addInstrument(this.instrumentForm.value)
    this.showSelectionModal = false
  }

  private getCollection() {
    let collection: HTMLDivElement[] = []
    for (let div of this.container?.nativeElement.children as any as HTMLDivElement[]) {
      collection.push(div)
      div.classList.remove('active-instrument')
    }
    this.HTMLIconCollection = collection

  }
}
