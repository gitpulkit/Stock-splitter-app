import logo from './logo.svg';
import './App.css';
import StockList from './stocks/StockList'
import React, { Component } from 'react'


class App extends Component {


render(){
  return (
    <div className="App">
     <StockList/> 
    </div>
  );
}


}export default App