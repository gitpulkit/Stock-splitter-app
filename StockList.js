import React from 'react'
import "./style.css"
 
// converts stockArray to stocks object
function getStockOptions(stockList) {
 // input stockList = [[1,"Apple",10],[2,"Google",40]]
 /* {
      1: {
          id: stockID,
          stockname: stockName,
          price: stockPrice,
          pct:0,
          numShares:0
      }
    }
 }*/
 const stocks = {};
 for (const index in stockList) {
   const stockArray = stockList[index]
   var stockID = stockArray[0]
   var stockName = stockArray[1]
   var stockPrice = stockArray[2]
   stocks[stockID] = {
     id: stockID,
     stockname: stockName,
     price: stockPrice,
     pct:0,
     numShares:0
   }
 }
 return stocks
}
// checks for empty values
function isEmpty(str) {
  if (str === '' || str === null){
     return true
  }
   return false;
 }
 
 // checks if given value is a non negative number
 function checkNumber(str) {
   var x = parseFloat(str);
   if (isNaN(x) || x < 0 ) {
     return false;
   }
   return true;
 }
 
 // checks if given value is a valid percentage
 function checkPct(str) {
   var x = parseFloat(str);
   if (isNaN(x) || x < 0 || x > 100) {
     return false;
   }
   return true;
 }
 
 // validates form values. Returns error message in case of errors.
 function validateState(stocks, totalAmt) {
   if (isEmpty(totalAmt)===true) {
     return "Please enter a value for total investment"
   }
   if (checkNumber(totalAmt)===false) {
     return "Total amount should be a valid number"
   }
   var totalPct = 0;
   for (const key in stocks) {
     const stockObj = stocks[key]
     var stockPct = stockObj.pct
     if (isEmpty(stockPct) === true) {
       return "Please enter the percentage value for stock"
     }
     if (checkPct(stockPct) === false) {
       return "Percentage should be a number between 0-100"
     }
     totalPct = totalPct + parseFloat(stockPct);
   }
   if (totalPct > 100) {
     return "The total percentage invested cannot be more than 100%"
   }
   return null
 } 
class StockList extends React.Component {
 constructor(props) {
   super(props);
   this.state = {
     error: null,
     isLoaded: false,
     stocks: {},
     selectedStockIds: [],
     amount: '',
     validationErr:null,// not used
     iscalculated:false,
   };
 this.handleChangeMulti = this.handleChangeMulti.bind(this);
 this.handleSubmit = this.handleSubmit.bind(this);
 }
 
 componentDidMount() {
   fetch('http://localhost:5000/getstockoptions')
   .then(res => res.json())
   .then(
     (stockList) => {
       // success !!
         const stocks = getStockOptions(stockList);
         this.setState({
           isLoaded : true,
           stocks: stocks
         });
       },
       // Note: it's important to handle errors here
       // instead of a catch() block so that we don't swallow
       // exceptions from actual bugs in components.
       (error) => {
         this.setState({
           isLoaded: true,
           error: error,
         });
       })
 }
 
 // handles onchange for investment input
 handleInvestmentChange(event) {
   this.setState({amount:event.target.value})
 }
 
 // handles onchange for percentage input
 handleInputChange(event, stockId) {
   const pctSetByUser = event.target.value;
   const oldStocks = this.state.stocks
   const targetStock = oldStocks[stockId]
   targetStock.pct = pctSetByUser
   const stockObject = {
     [stockId]: targetStock
   }
   const newStocks = { ...oldStocks, ...stockObject }
   this.setState({stocks: newStocks});
 }
 
 // handles onchange for stocks selection dropdown.
 handleChangeMulti(event) {
  const selectedStockId = event.target.value
  const oldStockIds = this.state.selectedStockIds
  const oldStocks = this.state.stocks
 const index = oldStockIds.indexOf(selectedStockId)
var newStocks = {}
  // if selected stock is not already present--> add it
  var newStockIds=[]
  if ( index >= 0) {
      //already present so remove it
    newStockIds = [...oldStockIds.slice(0, index), ...oldStockIds.slice(index + 1)]
    // also we need to reset the values for this stock
    const targetStock = oldStocks[selectedStockId]
    targetStock.pct = 0
    targetStock.numShares = 0
    const stockObject = {
        [selectedStockId]: targetStock
    }
     newStocks = { ...oldStocks, ...stockObject }
  } else {
      // add it
    newStockIds = [selectedStockId, ...oldStockIds]
    // this case we don't need to reset any stock values
    newStocks= oldStocks
    
  }
  this.setState({ selectedStockIds: newStockIds , stocks: newStocks});
}

 
 // on form submit, calculates stock split ...
 handleSubmit(event) {
   const stocks = this.state.stocks;
   const totalInvestment = this.state.amount;
   var validationErr = validateState(stocks, totalInvestment)
   if (validationErr!= null && validationErr !==''){
     alert(validationErr);
     event.preventDefault();
     return;
   }
   for (const index in stocks) {
     const stock = stocks[index]
     const pct = stock.pct
     const price = stock.price
     const numShares = (pct * totalInvestment / 100) / price
     stock.numShares = Math.floor(numShares)
   }
   
   this.setState({stocks:stocks,iscalculated:true})
   event.preventDefault();
 }
 
 render() {
     const { error, isLoaded } = this.state;
     if (error) {
         // error while fetching
         return <div>Error: {error.message}</div>;
     } else if (!isLoaded) {
         return <div>Loading...</div>;
     } else {
       return(
         <React.Fragment>
               <div>
                 <h1 style={{ backgroundColor: "#1abc9c", textAlign:"center"}}>Wealth Basket</h1>
                 <p></p>
               </div>
               <div className="form-style-5">
                 <form onSubmit={this.handleSubmit} >
                   <fieldset>
                     <legend><span className="number">1</span> Investment Info</legend>
                     <label>
                       Enter the investment amount (INR)
                     <input type="text" name="investAmount" value={this.state.amount} onChange={event => this.handleInvestmentChange(event)}></input>
                     </label>
 
                     <label>
                       Select Stock
                       <select multiple={true} value={this.state.selectedStockIds} onChange={this.handleChangeMulti}>
                       {Object.entries(this.state.stocks)
                         .map(([key, item]) => {
                               let itemID = item.id
                               return (
                                       <option key={itemID} value={item.id}>
                                       {`${item.stockname} (${item.price} INR)`}

                                       </option>
                               )
                         })}
                       </select>
                     </label>
                   </fieldset>
 
                   <fieldset>
                     <legend><span className="number">2</span> Shares split</legend>
                      <label>
                      Enter the percentage values for each share
                      </label>
                      <br></br>
                       {this.state.selectedStockIds.map(stockId => {
                           const stockName = this.state.stocks[stockId].stockname
                           const pct = this.state.stocks[stockId].pct
                           const price = this.state.stocks[stockId].price

                           return (
                               <React.Fragment>
                                   <label key={stockId}>
                                       {`${stockName} (${price} INR)`}
                                       <input type="text" key={stockId} name={stockId} value={pct} onChange={event => this.handleInputChange(event, stockId)} />
                                   </label>
                               </React.Fragment>
                           )})}
                   </fieldset>
 
                   <input type="submit" value="Calculate" className="submit-button" />
                 </form>
                 { this.state.iscalculated && ( 
                 <ul>

                                {(this.state.selectedStockIds).map((id) => {
                                let stockname= this.state.stocks[id].stockname
                                let numShares= this.state.stocks[id].numShares
                                
                                return (
                                  <li key={id}>{stockname}:{numShares}</li>
                                )
                              })}
                      </ul> )}

               

               </div>
             </React.Fragment>)
     }
   }
}
export default StockList
 
 
