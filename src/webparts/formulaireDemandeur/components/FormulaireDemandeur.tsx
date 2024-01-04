import * as React from 'react';
import stylescustom from './FormulaireDemandeur.module.scss';
import { IFormulaireDemandeurProps } from './IFormulaireDemandeurProps';
import { Dropdown, IDropdownOption, IDropdownProps, IDropdownStyles } from 'office-ui-fabric-react/lib/Dropdown';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { DatePicker, IDatePickerStrings } from 'office-ui-fabric-react/lib/DatePicker';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import {getFamilyProduct} from "../../../ApiServices/getFamilleProduit";
import {GetUserInfoURL} from "../../../API_END_POINTS/AchatModuleEndPoints";
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
// import { Web } from '@pnp/sp/webs';
import { mergeStyleSets } from 'office-ui-fabric-react/lib/Styling';
import {
  Fabric,
  loadTheme
} from "office-ui-fabric-react";
import { getTheme } from "@uifabric/styling";
import { Web } from '@pnp/sp/webs';
import { IItemAddResult } from '@pnp/sp/items';
import GraphService from '../../../services/GraphServices';
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



export default class FormulaireDemandeur extends React.Component<IFormulaireDemandeurProps, {}> {

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
      numberOfDays: "",
      fileData: "" as any,
      fileName: "",
    }],

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
    updatedFormData[index-1].fileData = null
    updatedFormData[index-1].fileName = null
    this.setState({
      formData: updatedFormData
    });
    (document.getElementById('uploadFile') as HTMLInputElement).value = "";
  }

  private handleChangeQuantity = (event: any, index: any) => {
    const inputValue = event.target.value;
    // Check if inputValue is a valid number
    if (!isNaN(inputValue) && inputValue !== '') {
      const updatedFormData = [...this.state.formData];
      updatedFormData[index - 1].quantity = inputValue;
      this.setState({
        formData: updatedFormData
      });
    }
  }


  public addFile(content:any) {
    var extention = content.target.files[0].name.split('.').pop();
    var encodedFileName = btoa(content.target.files[0].name.split('.').slice(0, -1).join('.')) + '.' + extention;

    const newFile = new File([content.target.files[0]], encodedFileName, { type: content.target.files[0].type });

    const updatedFormData = [...this.state.formData];
    updatedFormData[this.state.counterProducts - 1].fileName = content.target.files[0].name
    updatedFormData[this.state.counterProducts - 1].fileData = newFile

    this.setState({
      formData: updatedFormData
    });
  }



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


  private handleChangePrice = (event: any, index: any) => {
    const inputValue = event.target.value;
  
    // Check if inputValue is a valid number
    if (!isNaN(inputValue) && inputValue !== '') {
      const updatedFormData = [...this.state.formData];
      updatedFormData[index - 1].price = inputValue;
  
      this.setState({
        formData: updatedFormData
      });
    }
  }
  


  private handleChangeComment = (event:any, index: any) => {
    const updatedFormData = [...this.state.formData];
    updatedFormData[index-1].Comment = event.target.value
    this.setState({
      formData: updatedFormData
    });
  }


  private handleChangeFamilleDropdown = (event:any, index:any) => {
    console.log(event)
    const updatedFormData = [...this.state.formData];
    updatedFormData[index-1].FamilleSelected = [event]
    this.setState({
      formData: updatedFormData
    });
  }


  private handleChangeSousFamilleDropdown = (event:any, index: any) => {
    const updatedFormData = [...this.state.formData];
    updatedFormData[index-1].SousFamilleSelected = [event]
    this.setState({
      formData: updatedFormData
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

  private handleChangeDateSouhaite = (date:any, index: any) => {
    const updatedFormData = [...this.state.formData];
    updatedFormData[index-1].DateSouhaite = new Date(date)
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
      numberOfDays: "",
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
      formData.numberOfDays.length === 0
    ));
  }

  // private SendArticleToSharepointList = (data: any) => {
    
  // }

  // // Function to read file info
  // public readFile = (file: any) => {
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.onloadend = () => resolve(reader.result);
  //     reader.onerror = reject;
  //     reader.readAsArrayBuffer(file);
  //   });
  // };



  // private attachFileToItem = async (itemId: any, file: any) => {
  //   try {
  //     const fileContent: any = await this.readFile(file); // Implement the file reading logic
  //     const fileName = file.name;
  //     const response = await Web(this.props.url).lists.getByTitle("les demandes").items.getById(itemId).attachmentFiles.add(fileName,fileContent);
  //     console.log("File attached to item successfully:", response);
  //   } catch (error) {
  //     console.log("Error attaching file to item:", error);
  //   }
  // };


  private getFamilleProduit = () => {
    var listFamilleProduit = [{
      key: "FamilleID1",
      text: "Famille 1",
      data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    },
    {
      key: "FamilleID2",
      text: "Famille 2",
      data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    }]
    return listFamilleProduit
  }

  private getSousFamilleProduit = () => {
    var listSousFamilleProduit = [{
      key: "SOUSFamilleID1",
      text: "SOUSFamilleID1 1",
      data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    },
    {
      key: "SOUSFamilleID2",
      text: "SOUSFamilleID2 2",
      data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    }]
    return listSousFamilleProduit
  }


  private getArticle = () => {
    var listProduit = [{
      key: "ArticleID1",
      text: "Article 1",
      data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    },
    {
      key: "ArticleID2",
      text: "Article 2",
      data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    }]
    return listProduit
  }


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

  private getCurrentDate() {
    const currentDate = new Date();
    
    // Get day, month, and year components
    const day = ('0' + currentDate.getUTCDate()).slice(-2);
    const month = ('0' + (currentDate.getUTCMonth() + 1)).slice(-2); // Months are zero-based
    const year = currentDate.getUTCFullYear();
  
    // Assemble the date in the desired format
    const formattedDate = `${day}/${month}/${year}`;
  
    return formattedDate;
  }
  
  




  private submitFormData = async () => {
    const disabledSubmit = this.disabledSubmitButton();
    const currentUser = await Web(this.props.url).currentUser.get() ;
    var ArticleList = []
    var prixTotal = 0
    if (!disabledSubmit) {
      const data = this.state.formData;
      data.map(Article => {
        prixTotal = prixTotal + parseInt(Article.price);
        ArticleList.push({
          "Prix": Article.price,"quantité": Article.quantity,"DescriptionTechnique": Article.Comment, "ArticleREF": Article.ArticleSelected[0].key
        });
      });

      console.log(ArticleList)
      const getProbateurs = await Web(this.props.url).lists.getByTitle("ValidateurParEcole").items.filter("Ecole eq 'Ecole 1'").top(2000).orderBy("Created", false).get(); 
      const UserDisplayNameV1 = (await Web(this.props.url).siteUsers.getById(getProbateurs[0].ApprobateurV1Id).get()).Title ; 

      var formData = {
        "DemandeurId":currentUser.Id ,
        "EcoleId":4 ,
        "FamilleProduit": data[0].FamilleSelected[0].text,
        "FamilleProduitREF": data[0].FamilleSelected[0].key,
        "PrixTotal":prixTotal.toString(),
        "DelaiLivraisionSouhaite":data[0].numberOfDays,
        "Prix": "test ...." ,
        "Quantite": "test ....",
        "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
        "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
        "StatusDemande": "En cours de " + UserDisplayNameV1,
        "StatusDemandeV1":"En cours",
        "Produit": JSON.stringify(ArticleList),
        "CreerPar": currentUser.Title
      }
      const sendData: IItemAddResult = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.add(formData);

      const sendHistoryActions: IItemAddResult = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items
      .add({
        "DemandeID": sendData.data.ID.toString(),
        "Actions": JSON.stringify(["Creation de la demande le "+this.getCurrentDate(), "En cours de l'approbation de "+UserDisplayNameV1+" a partir de "+this.getCurrentDate()])
      });

      const sendApprobateursData: IItemAddResult = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items
      .add({
        "DemandeID": sendData.data.ID.toString(),
        "ApprobateurV1Id": { results: getProbateurs[0].ApprobateurV1Id },
        "ApprobateurV2Id": { results: getProbateurs[0].ApprobateurV2Id },
        "ApprobateurV3Id": { results: getProbateurs[0].ApprobateurV3Id },
        "StatusApprobateurV1": "En cours",
        "StatusApprobateurV2": "",
        "StatusApprobateurV3": "",
        "CommentaireApprobateurV1": "",
        "CommentaireApprobateurV2": "",
        "CommentaireApprobateurV3": "",
      });
      this.setState({showValidationPopUp:true})
      console.log(formData)
    }
  }


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


  private getDataTest = async() => {
    const vacationRequestsData = await Web(this.props.url).lists.getByTitle("DemandeAchat").items
      .top(2000)
      .orderBy("Created", false)
      .expand("Ecole")
      .select("Attachments", "AuthorId", "DelaiLivraisionSouhaite", "DemandeurId", "DemandeurStringId", "DescriptionTechnique", "Ecole/Title", "Ecole/Ecole", "FamilleProduit", "ID", "Prix", "PrixTotal", "Produit", "Quantite", "SousFamilleProduit", "StatusDemande", "Title")
      .get();    
    console.log(vacationRequestsData) ;
  }


  private handleInputChange = (event: any, index: any) => {
    const inputValue = event.target.value;
  
    // Check if inputValue is a valid number
    if (!isNaN(inputValue) && inputValue !== '') {
      const updatedFormData = [...this.state.formData];
      updatedFormData[index - 1].numberOfDays = inputValue;
  
      this.setState({
        formData: updatedFormData
      });
    }
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


  async componentDidMount() {
    // this.fetchDataAndHandle()
    this.getDataTest() ;
    this.loadUserInfo()
  }
  






  public render(): React.ReactElement<IFormulaireDemandeurProps> {

    // this.dropdownOptionsListFamille.push({
    //   key: "FamilleID",
    //   text: "Famille 1",
    //   data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    // },
    // {
    //   key: "FamilleID",
    //   text: "Famille 2",
    //   data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    // }
    // );


    // this.dropdownOptionsListSousFamille.push({
    //   key: "SousFamilleID",
    //   text: "SousFamille 1",
    //   data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    // },);


    // this.dropdownOptionsRefArticles.push({
    //   key: "RefArticle",
    //   text: "Article 1",
    //   data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    // },);


    // this.dropdownOptionsBeneficiaire.push(
    //   {
    //     key: "BenefID",
    //     text: "Benef n1",
    //     data: { icon: 'CircleShapeSolid', colorName: "#0000ff" }
    //   },
    //   {
    //     key: "BenefID",
    //     text: "Benef n2",
    //     data: { icon: 'CircleShapeSolid', colorName: "#0000ff" }
    //   },
    //   {
    //     key: "BenefID",
    //     text: "Benef n3",
    //     data: { icon: 'CircleShapeSolid', colorName: "#0000ff" }
    //   }
    // );



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
        <div className={stylescustom.formulaireDemandeur}>
          <div className={stylescustom.DC}>
            <p className={stylescustom.datenow}>Date : <span className="date-time">{FormatDate(new Date())}</span></p>
            <div className={stylescustom.titleh1}>Demande d'achat </div>
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
                    {console.log(this.state.formData[index - 1]['FamilleSelected'])}
                    <Dropdown
                      defaultValue={this.state.formData[index - 1]['FamilleSelected'] && this.state.formData[index - 1]['FamilleSelected'][0] ? this.state.formData[index - 1]['FamilleSelected'][0].key : ""}
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
                      options={this.getSousFamilleProduit()}                      
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
                      options={this.getArticle()}                     
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
                      type='number'
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
