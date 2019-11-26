import { Component } from '@angular/core';
import { NavController, LoadingController, AlertController, ItemSliding } from 'ionic-angular';

import { SurveyProvider } from '../../providers/survey/survey';
import { SurveyDetailsPage } from '../survey-details/survey-details';

import { SurveyModel } from "../../models/survey.model";

import { ApiWrapper } from '../../providers/survey/api-wrapper';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';


@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {
    
    surveys: SurveyModel[];
    archiveSurveys: SurveyModel[];
    defaultImages: any;
    noSurveys: boolean = false;
    currentYear = new Date().getFullYear();

    constructor(public navCtrl: NavController, public surveyProvider: SurveyProvider,
                public loadingCtrl: LoadingController, public alertCtrl: AlertController, public apiWrapper: ApiWrapper) {
        //this.getActiveSurveys();
        //this.getArchiveSurveys();
        this.getSurveys();
                

        // TO TEST API WRAPPER UNCOMMENT THIS CODE. 
        /*
        this.apiWrapper.api.surveys.get('getActive', { accessKey: true, ownerId: true }).subscribe(
            data => {
                console.log(data);
            },
            error => {
                console.log(<any>error);
            }
        );
        */
 
    }

    getSurveys() {
        let loading = this.loadingCtrl.create({
            content: "Cargando encuestas..."
        });
        loading.present();
        Observable.forkJoin(this.surveyProvider.getActiveSurveys(), this.surveyProvider.getArchiveSurveys())
            .subscribe(data => {
                // console.log(data);
                this.surveys = SurveyModel.fromJSONArray(data[0]);
                // console.log(this.surveys);
                //this.archiveSurveys = SurveyModel.fromJSONArray(data[1]);
                loading.dismiss();
            },
            error => {
                console.log(<any>error);
                if ((error.message == "Failed to get surveys.") || (error.message == "Http failure response for (unknown url): 0 Unknown Error")) this.noSurveys = true;
                loading.dismiss();
            });
    }

    getActiveSurveys() {
        let loading = this.loadingCtrl.create({
            content: "Cargando encuestas..."
        });

        loading.present();

        this.surveyProvider.getActiveSurveys()
            .subscribe(
                data => {
                    //console.log(data);
                    //this.surveys = data;
                    this.surveys = SurveyModel.fromJSONArray(data);
                    loading.dismiss();
                },
                error => {
                    console.log(<any>error);
                    if ((error.message == "Failed to get surveys.") || (error.message == "Http failure response for (unknown url): 0 Unknown Error")) this.noSurveys = true;
                    loading.dismiss();
            }
        );
    }

    // getArchiveSurveys() {
    //     this.surveyProvider.getArchiveSurveys()
    //         .subscribe(
    //             data => {
    //                 //console.log(data);
    //                 this.archiveSurveys = SurveyModel.fromJSONArray(data);
    //             },
    //             error => {
    //                 console.log(<any>error);
    //                 if ((error.message == "Failed to get surveys.") || (error.message == "Http failure response for (unknown url): 0 Unknown Error")) this.noSurveys = true;
    //         }
    //     );
    // }

    selectedSurvey(survey) {
        //console.log(survey);
        this.navCtrl.push(SurveyDetailsPage, {
            survey: survey
        });
    }

    presentAlert({
        survey = null,
        operation = '', 
      } = {}) {
        let options = this.alertConfig(operation);
        let alert = this.alertCtrl.create({
          title: options.title,
          subTitle: options.subTitle,
          buttons: [
            {
                text: 'Cancel',
                handler: () => {
                }
            },
            {
              text: 'Accept',
              handler: () => {
                if (operation == 'delete') this.deleteSurvey(survey);
                if (operation == 'activate') this.activateSurvey(survey);
                //if (operation == 'archive') this.archiveSurvey(survey);
                if (operation == "create") this.createSurvey("New Survey :)");
              }
            }
          ]
        });
        alert.present();
    }

    showPrompt(survey, slidingItem: ItemSliding) {
        let prompt = this.alertCtrl.create({
          title: 'Actualizar clave de acceso para cargar encuestas',
          message: "Ingrese la nueva clave de acceso",
          inputs: [
            {
              name: 'name',
              //placeholder: 'Name'
            },
          ],
          buttons: [
            {
              text: 'Cancelar',
              handler: data => {
                //console.log('Cancel clicked');
              }
            },
            {
              text: 'Aceptar',
              handler: data => {
                //console.log('Accept clicked');
                //console.log(data);
                //this.changeSurveyName(survey, data.name, slidingItem);
                //this.surveyProvider.NewKey=data.name;
                localStorage.setItem("newKey", data.name);
                location.reload(); 
                
              }
            }
          ]
        });
        prompt.present();
    }

    showPrompt1(survey, slidingItem: ItemSliding) {
        let prompt = this.alertCtrl.create({
          title: '<div align="center"> Creditos </div>' ,
          message: "<b> Edgar Pimentel </b> <br>" + "<b> Jose del Pozo </b> <br>" + "<b> Alberto Estrada </b> <br>" + "<b> Luis Pedro Gonzalez </b> <br>" + "<b> Oscar Gomez </b> <br>" + "<b> Miguel Rojas </b> <br>",
          
          buttons: [
            
            {
              text: 'Aceptar',
              
            }
          ]
        });
        prompt.present();
    }

    createSurvey(name) {
        let loading = this.loadingCtrl.create({
            content: "Creating Survey..."
        });

        loading.present();

        this.surveyProvider.createSurvey(name)
        .subscribe(
            data => {
                //console.log(data);
                let survey: SurveyModel = new SurveyModel(data);
                this.surveys.unshift(survey);
                loading.dismiss();
            },
            error => {
                console.log(<any>error);
                loading.dismiss();
            }
        );
    }


    deleteSurvey(survey) {
        let loading = this.loadingCtrl.create({
            content: "Deleting Survey..."
        });

        loading.present();

        this.surveyProvider.deleteSurvey(survey.Id)
        .subscribe(
            data => {
                console.log(data);
                loading.dismiss();
            },
            error => {
                console.log(<any>error);
                if (error.status == 200) {
                    if ( survey.IsArchived === false) this.surveys = this.removeElement(survey.Id, this.surveys);
                    //else this.archiveSurveys = this.removeElement(survey.Id, this.archiveSurveys);
                }
                loading.dismiss();
            }
        );
    }

    changeSurveyName(survey, newName, slidingItem) {
        let loading = this.loadingCtrl.create({
            content: "Updating Survey name..."
        });

        loading.present();

        this.surveyProvider.changeSurveyName(survey.Id, newName)
        .subscribe(
            data => {
                console.log(data);
                slidingItem.close();
                loading.dismiss();
            },
            error => {
                console.log(<any>error);
                if (error.status == 200)  {
                    survey.Name = newName;
                    slidingItem.close();
                }
                loading.dismiss();
            }
        );
    }

    activateSurvey(survey) {
        let loading = this.loadingCtrl.create({
            content: "Activating Survey..."
        });

        loading.present();

        this.surveyProvider.restoreSurvey(survey.Id)
        .subscribe(
            data => {
                console.log(data);
                loading.dismiss();
            },
            error => {
                console.log(<any>error);
                if (error.status == 200) {
                    this.surveys.push(survey);
                    this.archiveSurveys = this.removeElement(survey.Id, this.archiveSurveys);
                }
                loading.dismiss();
            }
        );
    }

    // archiveSurvey(survey) {
    //     let loading = this.loadingCtrl.create({
    //         content: "Archiving Survey..."
    //     });

    //     loading.present();

    //     this.surveyProvider.archiveSurvey(survey.Id)
    //     .subscribe(
    //         data => {
    //             console.log(data);
    //             loading.dismiss();
    //         },
    //         error => {
    //             console.log(<any>error);
    //             if (error.status == 200) {
    //                 this.archiveSurveys.push(survey);
    //                 this.surveys = this.removeElement(survey.Id, this.surveys);
    //             }
    //             loading.dismiss();
    //         }
    //     );
    // }

    removeElement(surveyId, surveys) {
        return surveys.filter(function(e) {
            return e.Id !== surveyId;
        });
    }

    alertConfig(operation) {
        let options = {
            delete: {title: 'Delete Survey', subTitle: '¿Are you sure to delete the survey?'},
            activate: {title: 'Activate Survey', subTitle: '¿Are you sure to activate the survey?'},
            archive: {title: 'Archive Survey', subTitle: '¿Are you sure to archive the survey?'},
            create: {title: 'Create Survey', subTitle: '¿Are you sure to create new survey?'}

        }
        return options[operation];
    }

   

}
