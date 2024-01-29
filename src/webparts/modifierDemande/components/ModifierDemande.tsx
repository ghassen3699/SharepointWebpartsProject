import * as React from 'react';
import stylescustom from './ModifierDemande.module.scss';
import { IModifierDemandeProps } from './IModifierDemandeProps';
import { Dropdown, IDropdownOption, IDropdownProps, IDropdownStyles } from 'office-ui-fabric-react/lib/Dropdown';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { IDatePickerStrings } from 'office-ui-fabric-react/lib/DatePicker';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import SweetAlert2 from 'react-sweetalert2';
var img = require('../../../image/UCT_image.png');
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items";
import "@pnp/sp/attachments";
import "@pnp/sp/site-users/web";
import { mergeStyleSets } from 'office-ui-fabric-react/lib/Styling';
import {
  Fabric,
  loadTheme
} from "office-ui-fabric-react";
import { getTheme } from "@uifabric/styling";
import { Web } from '@pnp/sp/webs';
import { IItemAddResult } from '@pnp/sp/items';
import GraphService from '../../../services/GraphServices';
import { getCurrentDate } from '../../../tools/FunctionTools';
loadTheme({
  palette: {
  },
  semanticColors: {
    bodyBackground: "white",
    inputBackground: "white",
    disabledBackground: "#7D2935",
    disabledText: "white"
  }
});
const theme = getTheme();


export const DatePickerStrings: IDatePickerStrings = {
  months: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
  shortMonths: ['Jan', 'Feb', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'],
  days: ['Diamanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
  shortDays: ['DI', 'LU', 'MA', 'ME', 'JE', 'VE', 'SA'],
  goToToday: "Aller à aujourd'hui",
  prevMonthAriaLabel: 'Aller au mois précédent',
  nextMonthAriaLabel: 'Aller au mois prochain',
  prevYearAriaLabel: "Aller à l'année précédente",
  nextYearAriaLabel: "Aller à l'année prochaine",
  invalidInputErrorMessage: 'Invalid date format.'
};


export const FormatDate = (date: any): string => {
  var date1 = new Date(date);
  var year = date1.getFullYear();
  var month = (1 + date1.getMonth()).toString();
  month = month.length > 1 ? month : '0' + month;
  var day = date1.getDate().toString();
  day = day.length > 1 ? day : '0' + day;
  return day + '/' + month + '/' + year;
};



export const FormatDateERP = (date: any): string => {
  var date1 = new Date(date);
  var year = date1.getFullYear();
  var month = (1 + date1.getMonth()).toString();
  month = month.length > 1 ? month : '0' + month;
  var day = date1.getDate().toString();
  day = day.length > 1 ? day : '0' + day;
  return year + '-' + month + '-' + day;
};

export default class ModifierDemande extends React.Component<IModifierDemandeProps, {}> {

  // State variables of webpart 
  public state = {

    formData : [{
      FamilleSelected: [] as any,
      SousFamilleSelected : [] as any,
      ArticleSelected: [] as any,
      BeneficiareSelected : [] as any,
      Comment: "",
      quantity: "",
      price: "" ,
      DateSouhaite: new Date() ,
      numberOfDays: 0,
      fileData: "" as any,
      fileName: "",
    }],

    FamilleID: "",
    SousFamilleID: "",

    ID: 0,
    userUPN: "",
    userId: "",
    userRegistrationNumber:"",
    userEstablishment:"",
    userName: "",
    userEmail: "",
    JobTitle: "",

    file: "" as null,
    loadingFile: false,
    fileName: "",
    MontantAlloue: 0 ,
    MontantConsommer: 0 ,
    MontantRestant: 0 ,
    counterProducts: 1 ,
    showValidationPopUp:false,
    errors: { file: "" }
  };  
  private _graphService = new GraphService(this.props.context);

  // private dropdownOptionsListFamille: { key: string, text: string, data: any }[] = [];
  // private dropdownOptionsListSousFamille: { key: string, text: string, data: any }[] = [];
  // private dropdownOptionsRefArticles: { key: string, text: string, data: any }[] = [];
  // private dropdownOptionsBeneficiaire: { key: string, text: string, data: any }[] = [];

  private getFamilleProduit = () => {
    var listFamilleProduit = [
    {
      key: "CARBURANT",
      text: "CARBURANT",
      data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    },{
      key: "CONSOMMABLE LABO/STUDIO",
      text: "CONSOMMABLE LABO/STUDIO",
      data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    },{
      key: "CONSTRUCTION ET AMENAGEMENT",
      text: "CONSTRUCTION ET AMENAGEMENT",
      data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    },{
      key: "DOCUMENTS IMPRIMABLE",
      text: "DOCUMENTS IMPRIMABLE",
      data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    }]
    return listFamilleProduit
  }

  private getSousFamilleProduit = () => {
    var listSousFamilleProduit = [{
      key: "CARBURANT",
      text: "CARBURANT",
      FamilleKey: "CARBURANT",
      data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    },
    {
      key: "ART & DECORATION",
      text: "ART & DECORATION",
      FamilleKey: "CONSOMMABLE LABO/STUDIO",
      data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    },
    {
      key: "AUDIOVISUEL",
      text: "AUDIOVISUEL",
      FamilleKey: "CONSOMMABLE LABO/STUDIO",
      data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    },
    {
      key: "BIOLOGIE",
      text: "BIOLOGIE",
      FamilleKey: "CONSOMMABLE LABO/STUDIO",
      data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    },
    {
      key: "CONSOMMABLES PROTHESE",
      text: "CONSOMMABLES PROTHESE",
      FamilleKey: "CONSOMMABLE LABO/STUDIO",
      data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    },
    {
      key: "NURSING",
      text: "NURSING",
      FamilleKey: "CONSOMMABLE LABO/STUDIO",
      data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    },
    {
      key: "OPTIQUES ET LUNETTERIES",
      text: "OPTIQUES ET LUNETTERIES",
      FamilleKey: "CONSOMMABLE LABO/STUDIO",
      data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    },
    {
      key: "TOPOGRAPHIQUE ET GEOLOGIQUE",
      text: "TOPOGRAPHIQUE ET GEOLOGIQUE",
      FamilleKey: "CONSOMMABLE LABO/STUDIO",
      data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    },
    {
      key: "ELECTROMECANIQUE",
      text: "ELECTROMECANIQUE",
      FamilleKey: "CONSOMMABLE LABO/STUDIO",
      data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    },
    {
      key: "VERRERIES",
      text: "VERRERIES",
      FamilleKey: "CONSOMMABLE LABO/STUDIO",
      data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    },
    {
      key: "PRODUITS CHIMIQUES",
      text: "PRODUITS CHIMIQUES",
      FamilleKey: "CONSOMMABLE LABO/STUDIO",
      data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    },
    {
      key: "SOUDURE",
      text: "SOUDURE",
      FamilleKey: "CONSOMMABLE LABO/STUDIO",
      data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    },
    {
      key: "AGENCEMENT ET AMENAGEMENT",
      text: "AGENCEMENT ET AMENAGEMENT",
      FamilleKey: "CONSTRUCTION ET AMENAGEMENT",
      data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    },
    {
      key: "DOCUMENTS IMPRIMABLE",
      text: "DOCUMENTS IMPRIMABLE",
      FamilleKey: "DOCUMENTS IMPRIMABLE",
      data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    }]
    return listSousFamilleProduit
  }


  getArticle = () => {
    var listProduit = [
      { key: "CHAUSSETTE_BASKET", text: "CHAUSSETTE BASKET", sousFamilleKey: "CARBURANT", Axe: "Fuel", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "BALLON", text: "BALLON", sousFamilleKey: "CARBURANT", Axe: "Fuel", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "LOCATION_TERRAIN", text: "LOCATION TERRAIN", sousFamilleKey: "CARBURANT", Axe: "Fuel", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "TENUE", text: "TENUE", sousFamilleKey: "ART & DECORATION", Axe: "Lab furniture", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "GASOIL", text: "GASOIL", sousFamilleKey: "AUDIOVISUEL", Axe: "Lab furniture", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "SERVICE_GASOIL", text: "SERVICE GASOIL", sousFamilleKey: "BIOLOGIE", Axe: "Lab furniture", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "CARTE_PAYAGE", text: "CARTE PAYAGE", sousFamilleKey: "BIOLOGIE", Axe: "Lab furniture", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "CONSOMMABLE_ART", text: "CONSOMMABLE ART", sousFamilleKey: "CONSOMMABLES PROTHESE", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "CONSOMABLES_AUDIOVISUEL", text: "CONSOMABLES AUDIOVISUEL", sousFamilleKey: "NURSING", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "PRODUITS_CHIMIQUE", text: "PRODUITS CHIMIQUE", sousFamilleKey: "OPTIQUES ET LUNETTERIES", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "CONSOMMABLES_BCP", text: "CONSOMMABLES BCP", sousFamilleKey: "TOPOGRAPHIQUE ET GEOLOGIQUE", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "CONSOMMABLE_PROTHESE", text: "CONSOMMABLE PROTHESE", sousFamilleKey: "ELECTROMECANIQUE", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "CONSOMMABLE_NURSING", text: "CONSOMMABLE NURSING", sousFamilleKey: "VERRERIES", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "Consomables_OPTIQUES_ET_LUNETTERIES", text: "Consomables OPTIQUES ET LUNETTERIES", sousFamilleKey: "PRODUITS CHIMIQUES", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "CONSOMABLES_TOPOGRAPHIQUE_ET_GEOLOGIQUE", text: "CONSOMABLES TOPOGRAPHIQUE ET GEOLOGIQUE", sousFamilleKey: "SOUDURE", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "CONSOMMABLE_ELECTROMECANIQUE", text: "CONSOMMABLE ELECTROMECANIQUE", sousFamilleKey: "SOUDURE", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "CONSOMABLES_VERRERIES", text: "CONSOMABLES VERRERIES", sousFamilleKey: "AGENCEMENT ET AMENAGEMENT", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "CONSOMMABLES_PRODUITS_CHIMIQUES", text: "CONSOMMABLES PRODUITS CHIMIQUES", sousFamilleKey: "AGENCEMENT ET AMENAGEMENT", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "Consomable_SOUDURE", text: "Consomable SOUDURE", sousFamilleKey: "AGENCEMENT ET AMENAGEMENT", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "Consomables_PHYSIOTHERAPIE", text: "Consomables PHYSIOTHERAPIE", sousFamilleKey: "AGENCEMENT ET AMENAGEMENT", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "Consomables_Climatisation", text: "Consomables Climatisation", sousFamilleKey: "AGENCEMENT ET AMENAGEMENT", Axe: "", data: {icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "FOURNITURE_ET_POSE", text: "FOURNITURE ET POSE", sousFamilleKey: "AGENCEMENT ET AMENAGEMENT", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "REAMENAGEMENT", text: "REAMENAGEMENT", sousFamilleKey: "AGENCEMENT ET AMENAGEMENT", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "PEINTURE_GENERALE", text: "PEINTURE GENERALE", sousFamilleKey: "AGENCEMENT ET AMENAGEMENT", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "CLIMATISATION", text: "CLIMATISATION", sousFamilleKey: "AGENCEMENT ET AMENAGEMENT", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "ENSEIGNES", text: "ENSEIGNES", sousFamilleKey: "AGENCEMENT ET AMENAGEMENT", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "ETUDES", text: "ETUDES", sousFamilleKey: "DOCUMENTS IMPRIMABLE", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "AMENAGEMENT", text: "AMENAGEMENT", sousFamilleKey: "DOCUMENTS IMPRIMABLE", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "RIDEAUX", text: "RIDEAUX", sousFamilleKey: "DOCUMENTS IMPRIMABLE", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "CLIMATISEURS", text: "CLIMATISEURS", sousFamilleKey: "DOCUMENTS IMPRIMABLE", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "TRAVAUX_AMENAGEMENT_ET_INSTALLATION_ELECTRICITE", text: "TRAVAUX AMENAGEMENT ET INSTALLATION ELECTRICITE", sousFamilleKey: "DOCUMENTS IMPRIMABLE", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "REGLEMENT_INTERIEUR", text: "REGLEMENT INTERIEUR", sousFamilleKey: "DOCUMENTS IMPRIMABLE", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "FORMULAIRE_DINSCRIPTION", text: "FORMULAIRE D'INSCRIPTION", sousFamilleKey: "DOCUMENTS IMPRIMABLE", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "JOURNAL_DE_STAGE", text: "JOURNAL DE STAGE", sousFamilleKey: "DOCUMENTS IMPRIMABLE", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "RAPPORT_DE_STAGE", text: "RAPPORT DE STAGE", sousFamilleKey: "DOCUMENTS IMPRIMABLE", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "FEUILLE_DE_EXAMEN", text: "FEUILLE D'EXAMEN", sousFamilleKey: "DOCUMENTS IMPRIMABLE", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "PAPIER_EN_TETE", text: "PAPIER EN TETE", sousFamilleKey: "DOCUMENTS IMPRIMABLE", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "IMPRIME_DE_DIPLOME", text: "IMPRIME DE DIPLÔME", sousFamilleKey: "DOCUMENTS IMPRIMABLE", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "ATTESTATION", text: "ATTESTATION", sousFamilleKey: "DOCUMENTS IMPRIMABLE", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "BLOC_NOTE", text: "BLOC NOTE", sousFamilleKey: "DOCUMENTS IMPRIMABLE", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "ETIQUETTES", text: "ETIQUETTES", sousFamilleKey: "DOCUMENTS IMPRIMABLE", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
    ];
    return listProduit;
  };


  private getBeneficaire = () => {
    var listBenef = [{
      key: "BenefID1",
      text: "BenefID1 1",
      data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    },
    {
      key: "BenefID2",
      text: "BenefID2 2",
      data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    }]
    return listBenef
  }

  

  public initDisableCommentsWrapper() {
    let CommentsWrapper = document.getElementById('CommentsWrapper');
    CommentsWrapper.innerHTML = "";
  }
  

  private onRenderOption(option: IDropdownOption): JSX.Element {
    return (
      <div>
        {option.data && option.data.icon && (
          <Icon style={{ marginRight: '8px', color: option.data.colorName }} iconName={option.data.icon} aria-hidden="true" title={option.data.icon} />
        )}
        <span>{option.text}</span>
      </div>
    );
  }


  private onRenderCaretDown(props: IDropdownProps): JSX.Element {
    return <Icon iconName="CirclePlus" />;
  }


  private onSelectionChanged(ev: React.FormEvent<HTMLDivElement>, item: IDropdownOption): void { }


  public initImage(index: any) {
    const updatedFormData = [...this.state.formData];
    updatedFormData[this.state.counterProducts - 1].fileName = "";
    updatedFormData[this.state.counterProducts - 1].fileData = "";
    this.setState({
      formData: updatedFormData
    });
    (document.getElementById('uploadFile') as HTMLInputElement).value = "";
  }

  private handleChangeQuantity = (event:any, index: any) => {
    const updatedFormData = [...this.state.formData];
    updatedFormData[index-1].quantity = event.target.value
    this.setState({
      formData: updatedFormData
    });
  }


  public addFile = (content: any) => {
    console.log(this.state.counterProducts);
  
    const fileName = content.target.files[0].name;
    const extension = fileName.split('.').pop();
    const encodedFileName = `${fileName.split('.').slice(0, -1).join('.')}_${Date.now()}.${extension}`;
  
    const newFile = new File([content.target.files[0]], encodedFileName, { type: content.target.files[0].type });
  
    const updatedFormData = [...this.state.formData];
    updatedFormData[this.state.counterProducts - 1].fileName = fileName; // Store the original file name
    updatedFormData[this.state.counterProducts - 1].fileData = newFile;
  
    this.setState({
      formData: updatedFormData
    });
  };



  private onRenderTitle(options: IDropdownOption[]): JSX.Element {
    const option = options[0];

    return (
      <div>
        {option.data && option.data.icon && (
          <Icon style={{ marginRight: '8px', color: option.data.colorName }} iconName={option.data.icon} aria-hidden="true" title={option.data.icon} />
        )}
        <span>{option.text} </span>
      </div>
    );
  }


  private handleChangePrice = (event:any, index: any) => {
    const updatedFormData = [...this.state.formData];
    updatedFormData[index-1].price = event.target.value
    this.setState({
      formData: updatedFormData
    });
  }


  private handleChangeComment = (event:any, index: any) => {
    const updatedFormData = [...this.state.formData];
    updatedFormData[index-1].Comment = event.target.value
    this.setState({
      formData: updatedFormData
    });
  }


  private handleChangeFamilleDropdown = (event:any, index:any) => {
    const updatedFormData = [...this.state.formData];
    updatedFormData[index-1].FamilleSelected = [event]
    this.setState({
      formData: updatedFormData,
      FamilleID: event.key,
      SousFamilleID: ""
    });
  }


  private handleChangeSousFamilleDropdown = (event:any, index: any) => {
    const updatedFormData = [...this.state.formData];
    updatedFormData[index-1].SousFamilleSelected = [event]
    this.setState({
      formData: updatedFormData,
      SousFamilleID: event.key
    });
  }


  private handleChangeArticleDropdown = (event:any, index: any) => {
    const updatedFormData = [...this.state.formData];
    updatedFormData[index-1].ArticleSelected = [event]
    this.setState({
      formData: updatedFormData
    });
  }


  private handleChangeDestinataireDropdown = (event:any, index: any) => {
    const updatedFormData = [...this.state.formData];
    updatedFormData[index-1].BeneficiareSelected = [event]
    this.setState({
      formData: updatedFormData
    });
  }



  private intToList(number: number): number[] {
    const result: number[] = [];
    for (let i = 1; i <= number; i++) {
      result.push(i);
    }
    return result;
  }



  private addArticle = () => {
    const nullObject = {
      FamilleSelected: [] as any,
      SousFamilleSelected: []as any,
      ArticleSelected: []as any,
      BeneficiareSelected: []as any,
      Comment: "",
      quantity:"",
      price:"",
      numberOfDays: 0,
      DateSouhaite: new Date(),
      fileData: "" as null,
      fileName: "",
    };

    const updatedFormData = [...this.state.formData];

    updatedFormData.push(nullObject);

    this.setState({
      formData: updatedFormData,
      counterProducts: this.state.counterProducts + 1,
    })
  }


  private disabledSubmitButton = () => {
    return this.state.formData.some(formData => (
      formData.FamilleSelected.length === 0 ||
      formData.SousFamilleSelected.length === 0 ||
      formData.ArticleSelected.length === 0 ||
      formData.BeneficiareSelected.length === 0 ||
      formData.quantity.length === 0 ||
      formData.price.length === 0 ||
      formData.Comment.length === 0 || 
      formData.numberOfDays === 0
    ));
  }



  // Function to read file info
  public readFile = (fileContent: any) => {
    return new Promise((resolve, reject) => {
      const blob = new Blob([fileContent]);
      const reader = new FileReader();

      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });
  };



  private attachFileToItem = async (itemId: any) => {
    try {
      const formData = this.state.formData[this.state.counterProducts - 1];
      const fileContent: any = await this.readFile(formData.fileData);
      const fileName = formData.fileName; // Use the original file name
  
      console.log("Original File Name:", fileName);
      console.log("File Content:", fileContent);
  
      const response = await Web(this.props.url)
        .lists.getByTitle("DemandeAchat")
        .items.getById(itemId)
        .attachmentFiles.add(fileName, fileContent);
  
      console.log("File attached to item successfully:", response);
    } catch (error) {
      console.log("Error attaching file to item:", error);
    }
  };



  private submitFormData = async () => {
    const disabledSubmit = this.disabledSubmitButton();
    const currentUser = await Web(this.props.url).currentUser.get();
    const DemandeID = this.getCurrentIDfromURL();
    const prevData = await this.getPrevDemandeInfo(DemandeID) ;


    
    // const BenefListData = this.getBeneficaire() ;
    var ArticleList = [];
    var prixTotal = 0;

    if (!disabledSubmit) {
        const data = this.state.formData;
        console.log(data) ;
        data.map(Article => {
          prixTotal = prixTotal + parseInt(Article.price);
          if (Article.fileData){
            ArticleList.push({
              "Prix": Article.price,
              "quantité": Article.quantity,
              "DescriptionTechnique": Article.Comment,
              "ArticleREF": Article.ArticleSelected[0].key,
              "ArticleFileName": Article.fileName, 
              "ArticleFileData": {
                "name": Article.fileData.name, 
                "size": Article.fileData.size,
                "type": Article.fileData.type,
                // "lastModified": Article.fileData.lastModified,
                // "lastModifiedDate": Article.fileData.lastModifiedDate,
              }
            });
          }else {
            ArticleList.push({
              "Prix": Article.price,
              "quantité": Article.quantity,
              "DescriptionTechnique": Article.Comment,
              "ArticleREF": Article.ArticleSelected[0].key,
              "ArticleFileName": Article.fileName, 
            });
          }
          
        });
      
        console.log(ArticleList)

        const getProbateurs = await Web(this.props.url).lists.getByTitle("ValidateurParEcole").items.filter("Ecole eq 'Ecole 3'").top(2000).orderBy("Created", false).get();

        var formData: {
          DemandeurId: number;
          EcoleId: number;
          FamilleProduit: any;
          PrixTotal: string;
          DelaiLivraisionSouhaite: number;
          Prix: string;
          Quantite: string;
          SousFamilleProduit: any;
          StatusDemande: string;
          StatusDemandeV1?: string;
          StatusDemandeV2?: string;
          StatusDemandeV3?: string;
          StatusDemandeV4?: string;
          Produit: any;
        };

        console.log(DemandeID);
        var Demande = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items.filter(`DemandeID eq ${DemandeID}`).get();
        console.log(Demande);
        if (Demande[0].StatusApprobateurV1 === "A modifier") {
            console.log(1);
            var UserDisplayNameV1 = "";

            if (getProbateurs[0].ApprobateurV1Id.length > 1){
              await Promise.all(
                getProbateurs[0].ApprobateurV1Id.map(async (approbateur) => {
                  try {
                    const user = await Web(this.props.url).siteUsers.getById(approbateur).get();
                    const UserDisplayNameV1Title = user.Title;
      
                    if (UserDisplayNameV1.length === 0) {
                      UserDisplayNameV1 = UserDisplayNameV1Title;
                    } else {
                      UserDisplayNameV1 = UserDisplayNameV1 + " Ou " + UserDisplayNameV1Title;
                    }
                  } catch (error) {
                    console.error(`Error retrieving user information for ${approbateur}:`, error);
                  }
                })
              );
            }else {
              const user = await Web(this.props.url).siteUsers.getById(Demande[0].ApprobateurV1Id[0]).get();
              UserDisplayNameV1 = user.Title;
            }

            formData = {
              "DemandeurId":currentUser.Id ,
              "EcoleId":getProbateurs[0].ID ,
              "FamilleProduit": data[0].FamilleSelected[0].text,
              "PrixTotal":prixTotal.toString(),
              "DelaiLivraisionSouhaite":data[0].numberOfDays,
              "Prix": "test ...." ,
              "Quantite": "test ....",
              "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
              "StatusDemande": "En cours de " + UserDisplayNameV1,
              "StatusDemandeV1": "En cours",
              "Produit": JSON.stringify(ArticleList),
            };
            console.log(formData)
            const updateDemandeAchat = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(parseInt(DemandeID)).update(formData);

            ArticleList.map(async (articleData, index) => {
              if (articleData && articleData.ArticleFileName){
                await this.attachFileToItem(parseInt(DemandeID))
              }else{
                console.log("the new file data : ",prevData[index].ArticleFileName)
                await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(parseInt(DemandeID)).attachmentFiles.getByName(prevData[index].ArticleFileName).delete()
              }
            })

            // Save historique block
            const historyData = await Web(this.props.url)
                .lists.getByTitle("HistoriqueDemande")
                .items.filter(`DemandeID eq ${DemandeID}`)
                .get();

            if (historyData.length > 0) {
                var resultArray = JSON.parse(historyData[0].Actions);
                resultArray.push(
                    "modifier par le demandeur a partir d'une demande de modification de la part de " +
                        UserDisplayNameV1 + " le "+ getCurrentDate()
                );
                resultArray.push(
                    "En cours de l'approbation de " +
                        UserDisplayNameV1 + " a partir de "+ getCurrentDate()
                );
                const saveHistorique = await Web(this.props.url)
                    .lists.getByTitle("HistoriqueDemande")
                    .items.getById(historyData[0].ID)
                    .update({
                        Actions: JSON.stringify(resultArray),
                    });
            }

            const updateWorkFlowApprobation = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items.getById(Demande[0].ID)
            .update({
              StatusApprobateurV1: "En cours",
              Notif: "Y"
            });
        } else if (Demande[0].StatusApprobateurV2 === "A modifier") {
            console.log(2);
            var UserDisplayNameV2 = "";

            if (getProbateurs[0].ApprobateurV2Id.length > 1){
              await Promise.all(
                getProbateurs[0].ApprobateurV2Id.map(async (approbateur) => {
                  try {
                    const user = await Web(this.props.url).siteUsers.getById(approbateur).get();
                    const UserDisplayNameV2Title = user.Title;
      
                    if (UserDisplayNameV2.length === 0) {
                      UserDisplayNameV2 = UserDisplayNameV2Title;
                    } else {
                      UserDisplayNameV2 = UserDisplayNameV2 + " Ou " + UserDisplayNameV2Title;
                    }
                  } catch (error) {
                    console.error(`Error retrieving user information for ${approbateur}:`, error);
                  }
                })
              );
            }else {
              const user = await Web(this.props.url).siteUsers.getById(Demande[0].ApprobateurV2Id[0]).get();
              UserDisplayNameV2 = user.Title;
            }

            formData = {
              "DemandeurId":currentUser.Id ,
              "EcoleId":getProbateurs[0].ID ,
              "FamilleProduit": data[0].FamilleSelected[0].text,
              "PrixTotal":prixTotal.toString(),
              "DelaiLivraisionSouhaite":data[0].numberOfDays,
              "Prix": "test ...." ,
              "Quantite": "test ....",
              "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
              "StatusDemande": "En cours de " + UserDisplayNameV2,
              "StatusDemandeV2": "En cours",
              "Produit": JSON.stringify(ArticleList),
            };
            const updateDemandeAchat = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(parseInt(DemandeID)).update(formData);

            ArticleList.map(async (articleData, index) => {
              if (articleData && articleData.ArticleFileName){
                await this.attachFileToItem(parseInt(DemandeID))
              }else{
                console.log("the new file data : ",prevData[index].ArticleFileName)
                await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(parseInt(DemandeID)).attachmentFiles.getByName(prevData[index].ArticleFileName).delete()
              }
            })

            // Save historique block
            const historyData = await Web(this.props.url)
              .lists.getByTitle("HistoriqueDemande")
              .items.filter(`DemandeID eq ${DemandeID}`)
              .get();

            if (historyData.length > 0) {
                var resultArray = JSON.parse(historyData[0].Actions);
                resultArray.push(
                    "modifier par le demandeur a partir d'une demande de modification de la part de " + UserDisplayNameV2 + " le "+ getCurrentDate()
                );
                resultArray.push("En cours de l'approbation de " + UserDisplayNameV2 + " a partir de" + getCurrentDate());
                const saveHistorique = await Web(this.props.url)
                  .lists.getByTitle("HistoriqueDemande")
                  .items.getById(historyData[0].ID)
                  .update({
                      Actions: JSON.stringify(resultArray),
                  });
            }

            const updateWorkFlowApprobation = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items.getById(Demande[0].ID)
              .update({
                  StatusApprobateurV2: "En cours",
                  Notif: "Y"
              });
        } else if (Demande[0].StatusApprobateurV3 === "A modifier") {
            console.log(3);
            var UserDisplayNameV3 = "";

            if (getProbateurs[0].ApprobateurV3Id.length > 1){
              await Promise.all(
                getProbateurs[0].ApprobateurV3Id.map(async (approbateur) => {
                  try {
                    const user = await Web(this.props.url).siteUsers.getById(approbateur).get();
                    const UserDisplayNameV3Title = user.Title;
      
                    if (UserDisplayNameV3.length === 0) {
                      UserDisplayNameV3 = UserDisplayNameV3Title;
                    } else {
                      UserDisplayNameV3 = UserDisplayNameV3 + " Ou " + UserDisplayNameV3Title;
                    }
                  } catch (error) {
                    console.error(`Error retrieving user information for ${approbateur}:`, error);
                  }
                })
              );
            }else {
              const user = await Web(this.props.url).siteUsers.getById(Demande[0].ApprobateurV3Id[0]).get();
              UserDisplayNameV2 = user.Title;
            }
            formData = {
              "DemandeurId":currentUser.Id ,
              "EcoleId":getProbateurs[0].ID ,
              "FamilleProduit": data[0].FamilleSelected[0].text,
              "PrixTotal":prixTotal.toString(),
              "DelaiLivraisionSouhaite":data[0].numberOfDays,
              "Prix": "test ...." ,
              "Quantite": "test ....",
              "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
              "StatusDemande": "En cours de " + UserDisplayNameV3,
              "StatusDemandeV3": "En cours",
              "Produit": JSON.stringify(ArticleList),
            };
            const updateDemandeAchat = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(parseInt(DemandeID)).update(formData);

            ArticleList.map(async (articleData, index) => {
              if (articleData && articleData.ArticleFileName){
                await this.attachFileToItem(parseInt(DemandeID))
              }else{
                console.log("the new file data : ",prevData[index].ArticleFileName)
                await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(parseInt(DemandeID)).attachmentFiles.getByName(prevData[index].ArticleFileName).delete()
              }
            })

            // Save historique block
            const historyData = await Web(this.props.url)
              .lists.getByTitle("HistoriqueDemande")
              .items.filter(`DemandeID eq ${DemandeID}`)
              .get();

            if (historyData.length > 0) {
              var resultArray = JSON.parse(historyData[0].Actions);
              resultArray.push(
                  "modifier par le demandeur a partir d'une demande de modification de la part de " + UserDisplayNameV3 + " le " + getCurrentDate()
              );
              resultArray.push(
                "En cours de l'approbation de " + UserDisplayNameV3 + " a partir de " + getCurrentDate() 
              );
              const saveHistorique = await Web(this.props.url)
                .lists.getByTitle("HistoriqueDemande")
                .items.getById(historyData[0].ID)
                .update({
                  Actions: JSON.stringify(resultArray),
                });
            }

            const updateWorkFlowApprobation = await Web(this.props.url)
              .lists.getByTitle("WorkflowApprobation")
              .items.getById(Demande[0].ID)
              .update({
                  StatusApprobateurV3: "En cours",
                  Notif: "Y"
              });
        }else if (Demande[0].StatusApprobateurV4 === "A modifier") {
          console.log(3);
          var UserDisplayNameV4 = "";

          if (getProbateurs[0].ApprobateurV4Id.length > 1){
            await Promise.all(
              getProbateurs[0].ApprobateurV4Id.map(async (approbateur) => {
                try {
                  const user = await Web(this.props.url).siteUsers.getById(approbateur).get();
                  const UserDisplayNameV4Title = user.Title;
    
                  if (UserDisplayNameV4.length === 0) {
                    UserDisplayNameV4 = UserDisplayNameV4Title;
                  } else {
                    UserDisplayNameV4 = UserDisplayNameV4 + " Ou " + UserDisplayNameV4Title;
                  }
                } catch (error) {
                  console.error(`Error retrieving user information for ${approbateur}:`, error);
                }
              })
            );
          }else {
            const user = await Web(this.props.url).siteUsers.getById(Demande[0].ApprobateurV4Id[0]).get();
            UserDisplayNameV2 = user.Title;
          }
          formData = {
            "DemandeurId":currentUser.Id ,
            "EcoleId":getProbateurs[0].ID ,
            "FamilleProduit": data[0].FamilleSelected[0].text,
            "PrixTotal":prixTotal.toString(),
            "DelaiLivraisionSouhaite":data[0].numberOfDays,
            "Prix": "test ...." ,
            "Quantite": "test ....",
            "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
            StatusDemande: "En cours de " + UserDisplayNameV4,
            StatusDemandeV4: "En cours",
            "Produit": JSON.stringify(ArticleList),
          };
          const updateDemandeAchat = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(parseInt(DemandeID)).update(formData);


          ArticleList.map(async (articleData, index) => {
            if (articleData && articleData.ArticleFileName){
              await this.attachFileToItem(parseInt(DemandeID))
            }else{
              console.log("the new file data : ",prevData[index].ArticleFileName)
              await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(parseInt(DemandeID)).attachmentFiles.getByName(prevData[index].ArticleFileName).delete()
            }
          })

          // Save historique block
          const historyData = await Web(this.props.url)
            .lists.getByTitle("HistoriqueDemande")
            .items.filter(`DemandeID eq ${DemandeID}`)
            .get();

          if (historyData.length > 0) {
            var resultArray = JSON.parse(historyData[0].Actions);
            resultArray.push(
                "modifier par le demandeur a partir d'une demande de modification de la part de " + UserDisplayNameV4 + " le " + getCurrentDate()
            );
            resultArray.push(
              "En cours de l'approbation de " + UserDisplayNameV4 + " a partir de " + getCurrentDate() 
            );
            const saveHistorique = await Web(this.props.url)
              .lists.getByTitle("HistoriqueDemande")
              .items.getById(historyData[0].ID)
              .update({
                Actions: JSON.stringify(resultArray),
              });
          }

          const updateWorkFlowApprobation = await Web(this.props.url)
            .lists.getByTitle("WorkflowApprobation")
            .items.getById(Demande[0].ID)
            .update({
                StatusApprobateurV4: "En cours",
                Notif: "Y"
            });
      }
      this.setState({ showValidationPopUp: true });
    }
  };



  // private fetchDataAndHandle = async () => {
  //   try {
  //     const data = await getFamilyProduct();
  //     console.log('Data:', data);
  //     // Do something with the data here
  //   } catch (error) {
  //     // Handle the error
  //     console.error('Error in fetchDataAndHandle:', error.message);
  //   }
  // };


  // private getDataTest = async() => {
  //   const vacationRequestsData = await Web(this.props.url).lists.getByTitle("DemandeAchat").items
  //     .top(2000)
  //     .orderBy("Created", false)
  //     .expand("Ecole")
  //     .select("Attachments", "AuthorId", "DelaiLivraisionSouhaite", "DemandeurId", "DemandeurStringId", "DescriptionTechnique", "Ecole/Title", "Ecole/Ecole", "FamilleProduit", "ID", "Prix", "PrixTotal", "Produit", "Quantite", "SousFamilleProduit", "StatusDemande", "Title")
  //     .get();    
  //   console.log(vacationRequestsData) ;
  // }


  private handleInputChange = (event:any, index: any) => {
    const updatedFormData = [...this.state.formData];
    updatedFormData[index-1].numberOfDays = event.target.value
    this.setState({
      formData: updatedFormData
    });
  }


  // public async getUserInfoFromERP1(establishment, registrationNumber) {
  //   try {
  //     const response = await fetch(GetUserInfoURL, {
  //       method: 'POST',
  //       headers: new Headers({ "Authorization": `Basic ${btoa(`INTRANET:UCG2021*++`)}`, 'Content-Type': 'application/json', 'Accept': '*/*' }),
  //       body: JSON.stringify({ "establishment": establishment, "registrationNumber": registrationNumber }),
  //     });
  //     console.log('response', response);
  //     let erp = await response.json();
  //     console.log('erp', erp);
  //     // this.setState({
  //     //   JobTitle: erp.data.Fonction,
  //     // });
  //     console.log('All userData from ERP:',erp.data)
  //     console.log('USER JOB: ',erp.data.Fonction)
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  
  private loadUserInfo() {
    // console.log(this.props.context.pageContext.legacyPageContext["userPrincipalName"])
    this._graphService.getUserId(this.props.context.pageContext.legacyPageContext["userPrincipalName"])
      .then(user => {
        console.log(user)
        this.setState({
          userName:user["displayName"],
          userEmail:user["mail"],
          userRegistrationNumber:user["employeeId"],
          userEstablishment:user["companyName"],
          JobTitle:user["jobTitle"],
        })
        // console.log('getUserInfoFromERP');
        // this.getUserInfoFromERP1(user["companyName"], user["employeeId"])
      });
  }

  private getPrevDemandeInfo = async(demanedID) => {
    const data = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(demanedID).get() ;
    var listProduits = JSON.parse(data.Produit)
    return listProduits ;
  }


  public getCurrentIDfromURL = () => {
    const currentURL = window.location.href;
    const urlOBJ = new URL(currentURL) ;
    return urlOBJ.searchParams.get('itemID');
  }


  public getCurrentDemandeInfo = async() => {
    const demandeID = this.getCurrentIDfromURL()
    const demandeData = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(parseInt(demandeID)).get()
    var listProduits = JSON.parse(demandeData.Produit)
    var index = 0

    console.log(demandeData)

    listProduits.map(produit => {
      index = index + 1 ;
      const updatedFormData = [...this.state.formData];
      console.log(updatedFormData)
      if(index === 1){
        const updatedFormData = [...this.state.formData];
        updatedFormData[index-1].FamilleSelected = [{"key":demandeData.FamilleProduitREF}]
        updatedFormData[index-1].SousFamilleSelected = [{"key":demandeData.SousFamilleProduitREF}]
        updatedFormData[index-1].ArticleSelected = [{"key":produit.ArticleREF}]
        // updatedFormData[index-1].BeneficiareSelected = demandeData
        updatedFormData[index-1].Comment = produit.DescriptionTechnique
        updatedFormData[index-1].quantity = produit.quantité
        updatedFormData[index-1].price = produit.Prix
        updatedFormData[index-1].DateSouhaite = demandeData.DelaiLivraisionSouhaite
        updatedFormData[index-1].numberOfDays = demandeData.DelaiLivraisionSouhaite
        updatedFormData[index-1].fileName = produit.ArticleFileData.name
        updatedFormData[index-1].fileData = {
          "name":produit.ArticleFileData.name,
          "size":produit.ArticleFileData.size,
          "type":produit.ArticleFileData.type,
        }
        this.setState({
          formData: updatedFormData,
          FamilleID: updatedFormData[0].FamilleSelected[0].key,
          SousFamilleID : updatedFormData[0].SousFamilleSelected[0].key,
        });
      }else {
        var nullObject
        if (produit.ArticleFileData){
          nullObject = {
            FamilleSelected: [{"key":demandeData.FamilleProduitREF}],
            SousFamilleSelected: [{"key":demandeData.SousFamilleProduitREF}],
            ArticleSelected: [{"key":produit.ArticleREF}],
            BeneficiareSelected: "",
            Comment: produit.DescriptionTechnique,
            quantity:produit.quantité,
            price:produit.Prix,
            numberOfDays: demandeData.DelaiLivraisionSouhaite,
            DateSouhaite: demandeData.DelaiLivraisionSouhaite,
            fileData:{
              "name":produit.ArticleFileData.name,
              "size":produit.ArticleFileData.size,
              "type":produit.ArticleFileData.type,
            }, 
            fileName: produit.ArticleFileData.name,
          };
        }else {
          nullObject = {
            FamilleSelected: [{"key":demandeData.FamilleProduitREF}],
            SousFamilleSelected: [{"key":demandeData.SousFamilleProduitREF}],
            ArticleSelected: [{"key":produit.ArticleREF}],
            BeneficiareSelected: "",
            Comment: produit.DescriptionTechnique,
            quantity:produit.quantité,
            price:produit.Prix,
            numberOfDays: demandeData.DelaiLivraisionSouhaite,
            DateSouhaite: demandeData.DelaiLivraisionSouhaite,
            fileData:{
              "name":"",
              "size":"",
              "type":"",
            }, 
            fileName: "",
          };
        }
    
        const updatedFormData = [...this.state.formData];
        updatedFormData.push(nullObject);
        this.setState({
          formData: updatedFormData,
          counterProducts: this.state.counterProducts + 1,
          FamilleID: updatedFormData[0].FamilleSelected[0].key,
        })
      }
    })
  }


  async componentDidMount() {
    // this.fetchDataAndHandle()
    // this.getDataTest() ;
    this.loadUserInfo() ;
    await this.getCurrentDemandeInfo() ;
  }

  public render(): React.ReactElement<IModifierDemandeProps> {
    const dropdownStyles: Partial<IDropdownStyles> = {
      title: { backgroundColor: "white" },
    };

    const controlClass = mergeStyleSets({
      TextField: { backgroundColor: "white", }
    });

    const disabledSubmit = this.disabledSubmitButton()
    return (
      <Fabric
        className="App"
        style={{ background: theme.semanticColors.bodyBackground, color: theme.semanticColors.bodyText }}
      >
        <div className={stylescustom.modifierDemande}>
          <div className={stylescustom.DC}>
            <p className={stylescustom.datenow}>Date : <span className="date-time">{FormatDate(new Date())}</span></p>
            <div className={stylescustom.titleh1}>Modifier demande d'achat </div>
            <div className={stylescustom.line}></div>
            <div className={stylescustom.row}>
              <div className={stylescustom.col}>
                <table className={stylescustom.table}>
                  <tbody>
                    <tr>
                      <td className={stylescustom.key}>Nom de l'employé</td>
                      <td className={stylescustom.value}>{this.state.userName}</td>
                    </tr>
                    <tr>
                      <td className={stylescustom.key}>Adresse email de l'organisation</td>
                      <td className={stylescustom.value}>{this.state.userEmail}</td>
                    </tr>
                    <tr>
                      <td className={stylescustom.key}>Matricule employé</td>
                      <td className={stylescustom.value}>{this.state.userRegistrationNumber}</td>
                    </tr>
                    <tr>
                      <td className={stylescustom.key}>Entité professionnelle</td>
                      <td className={stylescustom.value}>{this.state.userEstablishment}</td>
                    </tr>
                    <tr>
                      <td className={stylescustom.key}>Post</td>
                      <td className={stylescustom.value}>{this.state.JobTitle}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <p className={stylescustom.indique}>* Indique un champ obligatoire</p>

            {this.intToList(this.state.counterProducts).map((index) => 
              <div className='productsDiv'>
                <div className={stylescustom.row}>
                  <div className={stylescustom.data}>
                    <p className={stylescustom.title}>* Famille</p>
                    <Dropdown
                      defaultValue={this.state.formData[0]?.FamilleSelected?.[0]?.key || ""}
                      styles={dropdownStyles}
                      onRenderTitle={this.onRenderTitle}
                      onRenderOption={this.onRenderOption}
                      onRenderCaretDown={this.onRenderCaretDown}
                      options={this.getFamilleProduit()}
                      onChanged={(value) => this.handleChangeFamilleDropdown(value, index)}
                      defaultSelectedKey={this.state.formData[index - 1]['FamilleSelected'] && this.state.formData[index - 1]['FamilleSelected'][0] ? this.state.formData[index - 1]['FamilleSelected'][0].key : ""}
                    />
                  </div>

                  <div className={stylescustom.data}>
                    <p className={stylescustom.title}>* Sous famille</p>
                    <Dropdown
                      defaultSelectedKey={this.state.formData[index - 1]['SousFamilleSelected'] && this.state.formData[index - 1]['SousFamilleSelected'][0] ? this.state.formData[index - 1]['SousFamilleSelected'][0].key : ""}
                      styles={dropdownStyles}
                      onRenderTitle={this.onRenderTitle}
                      onRenderOption={this.onRenderOption}
                      onRenderCaretDown={this.onRenderCaretDown}
                      options={this.getSousFamilleProduit().filter(option => {
                        return option.FamilleKey === this.state.FamilleID
                      })}                     
                      onChanged={(value) => this.handleChangeSousFamilleDropdown(value, index)}
                    />
                  </div>



                  <div className={stylescustom.data}>
                    <p className={stylescustom.title}>* Réference de l'article</p>
                    <Dropdown
                      styles={dropdownStyles}
                      defaultSelectedKey={this.state.formData[index - 1]["ArticleSelected"] && this.state.formData[index - 1]["ArticleSelected"][0] ? this.state.formData[index - 1]["ArticleSelected"][0].key : ""}
                      onChange={this.onSelectionChanged}
                      onRenderTitle={this.onRenderTitle}
                      onRenderOption={this.onRenderOption}
                      onRenderCaretDown={this.onRenderCaretDown}
                      options={this.getArticle().filter(option => {
                        return option.sousFamilleKey === this.state.SousFamilleID
                      })}                      
                      onChanged={(value) => this.handleChangeArticleDropdown(value, index)}
                    />
                  </div>



                  <div className={stylescustom.data}>
                    <p className={stylescustom.title}>* Bénificaire / Déstinataire</p>
                    <Dropdown
                      styles={dropdownStyles}
                      defaultSelectedKey={this.state.formData[index - 1]["BeneficiareSelected"] && this.state.formData[index - 1]["BeneficiareSelected"][0] ? this.state.formData[index - 1]["BeneficiareSelected"][0].key : ""}
                      onChange={this.onSelectionChanged}
                      onRenderTitle={this.onRenderTitle}
                      onRenderOption={this.onRenderOption}
                      onRenderCaretDown={this.onRenderCaretDown}
                      options={this.getBeneficaire()}                      
                      onChanged={(value) => this.handleChangeDestinataireDropdown(value, index)}
                    />
                  </div>
                </div>


                <div className={stylescustom.row}>
                  <div className={stylescustom.data}>
                    <p className={stylescustom.title}>* Quantité demandée :</p>
                    <TextField 
                      className={controlClass.TextField} 
                      type='number'
                      onChange={(e) => this.handleChangeQuantity(e, index)}
                      value={ this.state.formData[index - 1]["quantity"] && this.state.formData[index - 1]["quantity"] ? this.state.formData[index - 1]["quantity"] : ""} 
                    />
                  </div>

                  <div className={stylescustom.data}>
                    <p className={stylescustom.title}>* Prix estimatifs :</p>
                    <TextField 
                      className={controlClass.TextField} 
                      onChange={(e) => this.handleChangePrice(e, index)}
                      value={this.state.formData[index - 1]["price"]} 
                    />
                  </div>


                  <div className={stylescustom.data}>
                    <p className={stylescustom.title}>* Delai le livraison souhaité :</p>
                    <TextField 
                      type='number'
                      value={String(this.state.formData[index - 1]["numberOfDays"])} 
                      onChange={(e) => this.handleInputChange(e, index)}
                    />
                  </div>


                  <div className={stylescustom.data}>
                    <p className={stylescustom.title}> Piéce jointe :</p>
                    <label htmlFor="uploadFile" className={stylescustom.btn}>Choisir un élément</label>
                    <input type="file" id="uploadFile" style={{ display: 'none' }}
                      accept=".jpg, .jpeg, .png , .pdf , .doc ,.docx"
                      onChange={(e) => { 
                        this.addFile(e); 
                        this.setState({ errors: { ...this.state.errors, file: "" } });}} 
                      />
                    {this.state.formData[index - 1].fileData && <span style={{ marginLeft: 10, fontSize: 14 }}>{this.state.formData[index - 1].fileName} <span style={{ cursor: 'pointer' }} onClick={() => { this.initImage(index); }}>&#10006;</span></span>}
                    <span style={{ color: "rgb(168, 0, 0)", fontSize: 12, fontWeight: 400, display: 'block' }}>
                      {this.state.errors.file !== "" ? this.state.errors.file : ""}
                    </span>
                  </div>
                </div>


                <div className={stylescustom.row}>
                  <div className={stylescustom.comment}>
                    <p className={stylescustom.title}>Commentaire :</p>
                    <TextField 
                      className={controlClass.TextField} 
                      value={this.state.formData[index - 1]["Comment"]} 
                      multiline 
                      onChange={(e) => this.handleChangeComment(e, index)}
                    />
                  </div>
                </div>
              </div>
            )}


            <table className={stylescustom.ad}>
              <thead>
                <th className={stylescustom.title} >Autres détails</th>
              </thead>
              <tbody className={stylescustom.tbody}>
                <tr>
                  <td className={stylescustom.key}>Le montant du budget </td>
                  <td className={stylescustom.value}></td>
                </tr>
              </tbody>
            </table>


            

            <div className={stylescustom.btncont}>
              {this.state.loadingFile ? <Spinner size={SpinnerSize.large} className={stylescustom.spinner} /> : ""}
              {/* <button disabled={this.state.btnSubmitDisable || this.state.loadingFile} onClick={() => this.SaveData()} className={stylescustom.btn}>soumettre la demande</button> */}
              <button disabled={disabledSubmit} className={stylescustom.btn} onClick={() => this.addArticle()}>AJOUTER UNE AUTRE ARTICLE</button>
              <button disabled={disabledSubmit} className={stylescustom.btn} onClick={() => this.submitFormData()}>soumettre la demande</button>
            </div>

            
            <SweetAlert2
              allowOutsideClick={false}
              show={this.state.showValidationPopUp} 
              title="Demande des Articles" 
              text="Demande envoyée"
              imageUrl={img}
              confirmButtonColor='#7D2935'
              onConfirm={() => window.open(this.props.url + "/SitePages/DashboardDemandeur.aspx", "_self")}
              imageWidth="150"
              imageHeight="150"
            />

            {/* <SweetAlert2
              show={true} title="Demande de congé" text="Votre solde de congé est insuffisant"
              imageUrl={img}
              confirmButtonColor='#7D2935'
              onConfirm={() => this.setState({ alerteligibility: false })}
              imageWidth="200"
              imageHeight="200"
            /> */}
          </div>
        </div>
      </Fabric>
    );
  }
}
