import {
    Component,
    OnInit,
    Input,
    SimpleChanges,
    OnChanges,
    Output,
    EventEmitter,
    ChangeDetectorRef,
    ChangeDetectionStrategy
} from "@angular/core";
import {FormGroup, FormControl, FormBuilder, Validators, FormArray, AbstractControl} from "@angular/forms";
import "rxjs/add/operator/map";
import "rxjs/add/operator/toPromise";
import "rxjs/Rx";
import {VoicetextdataService} from "./voicetextdata.service";
import {Wirelessdata} from './voicetextdata-model';
import {wirelessMockData} from "../../wireless-mock-data";
import {forEach} from "@angular/router/src/utils/collection";
@Component({
    selector: 'voicetextdata-component',
    templateUrl: './voicetextdata.component.html',
    styleUrls: ['./voicetextdata.component.css'],
    providers: [VoicetextdataService]
})
export class VoicetextdataComponent implements OnInit {

    @Input() formTitle: string = "Voice";
    public voiceWirelessForm: FormGroup;
    public submitted: boolean;
    public events: any[] = [];
    private btnName: string = "Add";
    private selectedTab: boolean = false;
    private bgColorGSMButton: string = '#aa0023';
    private bgColorCDMAButton: string = 'white';
    private gsmPanelView: boolean = false;
    private cdmaPanelView: boolean = false;
    private gsmcdmaBtngroup: boolean = false;
    private iccidshow: boolean = false;
    @Input() public addVoiceShow: boolean = true;
    @Input() public wirelessChangeShow: boolean = false;
    private noDataFound: boolean = false;
    private newMinShow:boolean=false;
    private newMeidShow:boolean=false;

    private serviceTypes: any[] = [
        {"type": "GSM"},
        {"type": "CDMA"}
    ];
    private planTypes: any[] = [
        {"type": "Prepaid"},
        {"type": "Postpaid"}
    ];
    //^(OFF|ON|INTERNATIONAL_ROAM)$
    private incomingOutgoingCallsTypes = [
        {"type": "OFF"},
        {"type": "ON"},
        {"type": "INTERNATIONAL_ROAM"},
    ]
    private entertainmentCallsType = [
        {"type": "OFF"},
        {"type": "ON"},
    ]
    private noReplyTimer = [
        {"type": 10},
        {"type": 15},
        {"type": 20},
        {"type": 25},
        {"type": 30}

    ]
    private gsmactiveclass: string = 'active';
    private cdmaactiveclass: string = '';
    expiryRegex: string = `^[0-9]*$`;
    iccidRegx: string = "^89013113[0-9]{12,12}$";
    public serviceSelected: string = "";


    constructor(private _fb: FormBuilder, private voicetextdataService: VoicetextdataService) {
        this.voiceWirelessForm = this._fb.group({
            telephoneNumber: ['', Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern(this.expiryRegex)])],
            serviceType: [''],
            planType: [''],
            iccid: [" ", Validators.compose([Validators.required, Validators.pattern(this.iccidRegx)])],
            meid: ['', Validators.compose([Validators.required, Validators.minLength(11), Validators.maxLength(18)])],
            min: ['', Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(10)])],
            barring: this._fb.group({
                allIncomingCalls: this._fb.group({
                    provisioned: [''],
                    active: ''
                }),
                allOutgoingCalls: this._fb.group({
                    provisioned: [''],
                    active: ''
                }),
                allOutgoingCallsInternational: this._fb.group({
                    provisioned: [''],
                    active: ''
                }),
                incomingCallsRoaming: this._fb.group({
                    provisioned: [''],
                    active: ''
                }),
                offNetworkInternationalCalls: this._fb.group({
                    provisioned: [''],
                    active: ''
                }),
            }),
            callForwarding: this._fb.group({
                default: this._fb.group({
                    provisioned: [''],
                    active: '',
                    forwardToTelephoneNumber: [" ", Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(10)])],
                    noReplyTimer: ['']
                }),
                noReply: this._fb.group({
                    provisioned: [''],
                    active: '',
                    forwardToTelephoneNumber: [" ", Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(10)])],
                    noReplyTimer: ['']
                }),
                notReachable: this._fb.group({
                    provisioned: [''],
                    active: '',
                    forwardToTelephoneNumber: [" ", Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(10)])],
                }),
                subscriberBusy: this._fb.group({
                    provisioned: [""],
                    active: '',
                    forwardToTelephoneNumber: [" ", Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(10)])]
                }),
                unconditional: this._fb.group({
                    provisioned: [''],
                    active: '',
                    forwardToTelephoneNumber: ['']
                })
            }),
            callHold: [''],
            callWaiting: [''],
            faxService: [''],
            lineIdentification: this._fb.group({
                callingPresentation: [""],
                callingRestriction: [""],
                permanentCallingRestriction: [""]
            }),
            lockSupplementaryServices: [""],
            multiPartyService: [""],
            operatorBarring: this._fb.group({
                incomingCalls: [''],
                outgoingCalls: [''],
                premiumEntertainmentCalls: [''],
                premiumInformationCalls: [''],
                roamingCalls: [''],
                interstateCalls: [''],
                lifelineRoamingBlock: ['']
            })
        });
    }


    ngOnInit() {
        this.subcribeToFormChanges();
        // if(this.wirelessChangeShow==true){
        //     this.addVoiceShow=false;
        // }
    }

//     const arrayControl = <FormArray>this.myForm.controls['formArray'];
//     let newGroup = this.fb.group({
//     /// new controls
// }
//     this.voiceWirelessForm.push(newGroup);

    newgroup = this._fb.group({
        newiccid: [""],
        newMin: [""]
    });
    // this.voiceWirelessForm.push(this.newgroup);

    subcribeToFormChanges() {
        const voiceWirelessFormStatusChanges$ = this.voiceWirelessForm.statusChanges;
        const voiceWirelessFormValueChanges$ = this.voiceWirelessForm.valueChanges;

        voiceWirelessFormStatusChanges$.subscribe(x => this.events.push({event: 'STATUS_CHANGED', object: x}));
        voiceWirelessFormValueChanges$.subscribe(x => this.events.push({event: 'VALUE_CHANGED', object: x}));
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['wirelessChangeShow']) {
            console.log(this.wirelessChangeShow);
            console.log("wirelessChangeShow has been changed");

        }
        if (changes['addVoiceShow']) {
            console.log(this.addVoiceShow);
            console.log("wirelessChangeShow has been changed");

        }
    }


    serviceSelect(e) {
        let tempArray: any[];
        console.log("First.." + e.target.value.split(':')[0]);

        console.log("First.." + e.target.value.split(':')[1]);
        let tempStr = e.target.value.split(':')[1];

        this.gsmcdmaBtngroup = true;
        if (tempStr == " GSM") {
            this.serviceSelected = "GSM"
            console.log('this is GSM');
            this.bgColorCDMAButton = '#c79e9e';
            this.bgColorGSMButton = '#aa0023';
            this.gsmPanelView = true;
            this.cdmaPanelView = false;
            this.iccidshow = true;
            this.newMinShow=false;
            this.newMeidShow=false;

            // (<FormControl>this.voiceWirelessForm.controls['planType'])
            //     .setValue('Prepaid', { onlySelf: true });

        }
        else if (tempStr == " CDMA") {
            this.serviceSelected = "CDMA"
            console.log('CDMA this is ');
            this.bgColorCDMAButton = '#aa0023';
            this.bgColorGSMButton = '#c79e9e';
            this.cdmaPanelView = true;
            this.gsmPanelView = false;
            this.iccidshow = false;
            this.newMinShow=true;
            this.newMeidShow=true;
        }
        else if (tempStr == undefined) {
            this.cdmaPanelView = false;
            this.gsmPanelView = false;
            this.gsmcdmaBtngroup = false;
            this.iccidshow = false;
            this.newMinShow=false;
            this.newMeidShow=false;
        }
        else {

            this.cdmaPanelView = true;
            this.gsmPanelView = false;
            this.gsmcdmaBtngroup = false;
            this.iccidshow = false;
            this.newMinShow=false;
            this.newMeidShow=false;
        }

    }

    getActive(c: string) {
        if (c == 'CDMA') {
            return 'active'
        }
    }

    gsmBtnSelect() {
        this.bgColorCDMAButton = '#c79e9e';
        this.bgColorGSMButton = '#aa0023';
        this.gsmPanelView = true;
        this.cdmaPanelView = false;
    }

    cdmaBtnSelect() {
        this.bgColorCDMAButton = '#aa0023';
        this.bgColorGSMButton = '#c79e9e';
        this.cdmaPanelView = true;
        this.gsmPanelView = false;
    }


    saveData(data, b: boolean) {
        console.log("SavingData");
        console.log(data);
        console.log(b);
        this.voicetextdataService.postVoiceTextData("http://localhost:4200", data)
            .subscribe(res => {

                    console.log(res);
                },
                error => {
                    console.log(error);
                }
            );

    }

    resetFormData() {
        this.voiceWirelessForm.reset();
    }

    public flagValue: boolean = false;
    public itemIdex: number;

    searchTelephoneNumber(inputTel: number) {

        this.voiceWirelessForm.reset();

        this.btnName = "Change";
        console.log(inputTel);
        this.addVoiceShow = true;
        //Placeholder for search telphone number for through service
        this.voicetextdataService.telephoneNumberSearch(inputTel).subscribe(
            response => {
                console.log(response)
            },
            error => {
                console.log(error);
            },
            () => {
                console.log("Completed");
            }
        );

        console.log(wirelessMockData[0].serviceType);
        for (let i = 0; i <= wirelessMockData.length - 1; i++) {
            console.log(wirelessMockData[i].telephoneNumber);
            if (wirelessMockData[i].telephoneNumber == inputTel) {
                console.log("matched");
                this.flagValue = true;
                this.itemIdex = i;
            }
        }
        if ((this.flagValue) && (this.itemIdex != undefined)) {
            this.flagValue = false;
            this.noDataFound = false;
            let i = this.itemIdex;

            if (wirelessMockData[i].serviceType == "GSM") {
                this.gsmcdmaBtngroup = true;
                this.serviceSelected = "GSM";
                this.bgColorCDMAButton = '#c79e9e';
                this.bgColorGSMButton = '#aa0023';
                this.gsmPanelView = true;
                this.cdmaPanelView = false;
                this.iccidshow = true;
                this.newMinShow=false;
                this.newMeidShow=false;
            }
            else if (wirelessMockData[i].serviceType == "CDMA") {
                this.gsmcdmaBtngroup = true;
                this.serviceSelected = "CDMA"
                console.log('CDMA this is ');
                this.bgColorCDMAButton = '#aa0023';
                this.bgColorGSMButton = '#c79e9e';
                this.cdmaPanelView = true;
                this.gsmPanelView = false;
                this.iccidshow = false;
                this.newMinShow=true;
                this.newMeidShow=true;

            }
            else if (wirelessMockData[i].serviceType == undefined) {
                this.cdmaPanelView = false;
                this.gsmPanelView = false;
                this.gsmcdmaBtngroup = false;
                this.iccidshow = false;
                this.newMinShow=false;
                this.newMeidShow=false;
            }
            else {
                this.cdmaPanelView = false;
                this.gsmPanelView = false;
                this.gsmcdmaBtngroup = false;
                this.iccidshow = false;
                this.newMinShow=false;
                this.newMeidShow=false;
            }

            console.log(wirelessMockData[i].barring.allOutgoingCalls['active']);
            this.voiceWirelessForm = this._fb.group({
                telephoneNumber: [wirelessMockData[i].telephoneNumber, Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern(this.expiryRegex)])],
                serviceType: [wirelessMockData[i].serviceType],
                planType: [wirelessMockData[i].planType],
                iccid: [wirelessMockData[i].iccid, Validators.compose([Validators.required, Validators.pattern(this.iccidRegx)])],
                meid: [wirelessMockData[i].meid, Validators.compose([Validators.required, Validators.minLength(11), Validators.maxLength(18)])],
                min: [wirelessMockData[i].min, Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(10)])],
                barring: this._fb.group({
                    allIncomingCalls: this._fb.group({
                        provisioned: [wirelessMockData[i].barring.allIncomingCalls.provisioned],
                        active: wirelessMockData[i].barring.allIncomingCalls.active
                    }),
                    allOutgoingCalls: this._fb.group({
                        provisioned: [wirelessMockData[i].barring.allOutgoingCalls.provisioned],
                        active: wirelessMockData[i].barring.allOutgoingCalls.active
                    }),
                    allOutgoingCallsInternational: this._fb.group({
                        provisioned: [wirelessMockData[i].barring.allOutgoingCallsInternational.provisioned],
                        active: wirelessMockData[i].barring.allOutgoingCallsInternational.active
                    }),
                    incomingCallsRoaming: this._fb.group({
                        provisioned: [wirelessMockData[i].barring.incomingCallsRoaming.provisioned],
                        active: wirelessMockData[i].barring.incomingCallsRoaming.active
                    }),
                    offNetworkInternationalCalls: this._fb.group({
                        provisioned: [wirelessMockData[i].barring.offNetworkInternationalCalls.provisioned],
                        active: wirelessMockData[i].barring.offNetworkInternationalCalls.active
                    }),
                }),
                callForwarding: this._fb.group({
                    default: this._fb.group({
                        provisioned: [wirelessMockData[i].callForwarding.default.provisioned],
                        active: wirelessMockData[i].callForwarding.default.active,
                        forwardToTelephoneNumber: [wirelessMockData[i].callForwarding.default.forwardToTelephoneNumber, Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(10)])],
                        noReplyTimer: [wirelessMockData[i].callForwarding.default.noReplyTimer]
                    }),
                    noReply: this._fb.group({
                        provisioned: [wirelessMockData[i].callForwarding.noReply.provisioned],
                        active: wirelessMockData[i].callForwarding.noReply.active,
                        forwardToTelephoneNumber: [wirelessMockData[i].callForwarding.noReply.forwardToTelephoneNumber, Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(10)])],
                        noReplyTimer: [wirelessMockData[i].callForwarding.noReply.noReplyTimer]
                    }),
                    notReachable: this._fb.group({
                        provisioned: [wirelessMockData[i].callForwarding.notReachable.provisioned],
                        active: wirelessMockData[i].callForwarding.notReachable.active,
                        forwardToTelephoneNumber: [wirelessMockData[i].callForwarding.notReachable.forwardToTelephoneNumber, Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(10)])],
                    }),
                    subscriberBusy: this._fb.group({
                        provisioned: [wirelessMockData[i].callForwarding.subscriberBusy.provisioned],
                        active: wirelessMockData[i].callForwarding.subscriberBusy.active,
                        forwardToTelephoneNumber: [wirelessMockData[i].callForwarding.subscriberBusy.forwardToTelephoneNumber, Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(10)])],
                    }),
                    unconditional: this._fb.group({
                        provisioned: [wirelessMockData[i].callForwarding.unconditional.provisioned],
                        active: wirelessMockData[i].callForwarding.unconditional.active,
                        forwardToTelephoneNumber: [wirelessMockData[i].callForwarding.unconditional.forwardToTelephoneNumber, Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(10)])],
                    })
                }),
                callHold: [wirelessMockData[i].callHold],
                callWaiting: [wirelessMockData[i].callWaiting],
                faxService: [wirelessMockData[i].faxService],
                lineIdentification: this._fb.group({
                    callingPresentation: [wirelessMockData[i].lineIdentification.callingPresentation],
                    callingRestriction: [wirelessMockData[i].lineIdentification.callingRestriction],
                    permanentCallingRestriction: [wirelessMockData[i].lineIdentification.permanentCallingRestriction]
                }),
                lockSupplementaryServices: [wirelessMockData[i].lockSupplementaryServices],
                multiPartyService: [wirelessMockData[i].multiPartyService],
                operatorBarring: this._fb.group({
                    incomingCalls: [wirelessMockData[i].operatorBarring.incomingCalls],
                    outgoingCalls: [wirelessMockData[i].operatorBarring.outgoingCalls],
                    premiumEntertainmentCalls: [wirelessMockData[i].operatorBarring.premiumEntertainmentCalls],
                    premiumInformationCalls: [wirelessMockData[i].operatorBarring.premiumInformationCalls],
                    roamingCalls: [wirelessMockData[i].operatorBarring.roamingCalls],
                    interstateCalls: [wirelessMockData[i].operatorBarring.interstateCalls],
                    lifelineRoamingBlock: [wirelessMockData[i].operatorBarring.lifelineRoamingBlock],
                })
            });


        }
        else {
            this.btnName = "ADD";
            (<FormControl>this.voiceWirelessForm.controls['telephoneNumber'])
                .setValue(inputTel, {onlySelf: true});
            this.noDataFound = true;
            console.log("Data not found");
        }

        this.voiceWirelessForm.controls.iccid.disable();
        this.voiceWirelessForm.controls.min.disable();
        this.voiceWirelessForm.controls.meid.disable();

        this.voiceWirelessForm.addControl("newIccid", new FormControl("", [Validators.required]));
        this.voiceWirelessForm.addControl("newMeid", new FormControl("", [Validators.required]));
        this.voiceWirelessForm.addControl("newMin", new FormControl("", [Validators.required]));
        this.voiceWirelessForm.addControl("suspend", new FormControl("", [Validators.required]));


    }

}
