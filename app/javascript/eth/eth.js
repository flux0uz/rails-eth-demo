// import BoleroABI from "./boleroABI.json";
import BoleroABI from "./airbnbABI.json";
const properties = [];
const init = () => {
  const Web3 = require("web3");

  let metamaskWeb3 = new Web3("https://rpc-mumbai.maticvigil.com");
  let account = null;
  let boleroContract;
  // let boleroContractAddress = "0x60998c7F3188a411E60F160E13d640cdD6197361"; // Paste Contract address here
  let boleroContractAddress = "0xc614E87e49504bDFdF1257c1A5f109ec7DCdbC2A"; // Paste Contract address here

  function web3() {
    return metamaskWeb3;
  }

  const accountAddress = () => {
    return account;
  };

  async function setProvider() {
    // TODO: get injected Metamask Object and create Web3 instance
    if (window.ethereum) {
      metamaskWeb3 = new Web3(ethereum);
      try {
        // Request account access if needed
        await ethereum.request({ method: "eth_requestAccounts" });
      } catch (error) {
        // User denied account access...
      }
    } else if (window.web3) {
      metamaskWeb3 = new Web3(web3.currentProvider);
    }
    account = await metamaskWeb3.eth.getAccounts();
    document.getElementById("user-account").innerHTML = account[0];
  }

  // Bind MetaMask connect button to open metamask modal
  const metamaskButton = document.getElementById("metamask");
  metamaskButton.addEventListener("click", () => {
    setProvider();
  });

  function getBoleroContract() {
    // TODO: create and return contract Object
    boleroContract = new metamaskWeb3.eth.Contract(
      BoleroABI.abi,
      boleroContractAddress
    );
    return boleroContract;
  }

  async function rentProperty(id, startDate, endDate, totalPrice) {
    await getBoleroContract()
      .methods.rentProperty(id, startDate, endDate)
      .send({ from: account[0], value: totalPrice });
    alert("Booked successfuly!");
  }

  document.addEventListener("click", (e) => {
    // e.preventDefault();
    if (e.target.classList.contains("btn-success")) {
      const id = document.getElementById("book").getAttribute("data-id");
      // get Start date
      const startDay = new Date(document.getElementById("startDay").value);
      const start = new Date(startDay.getFullYear(), 0, 0);
      const startDiff = startDay - start;
      const startOneDay = 1000 * 60 * 60 * 24;
      const starDay = Math.floor(startDiff / startOneDay);
      const startDOY = starDay;
      // get End date
      const endDay = new Date(document.getElementById("endDay").value);
      const end = new Date(endDay.getFullYear(), 0, 0);
      const endDiff = endDay - end;
      const endOneDay = 1000 * 60 * 60 * 24;
      const enDay = Math.floor(endDiff / endOneDay);
      const endDOY = enDay;
      // price calculation
      const price = document
        .getElementById("price-1")
        .getAttribute("data-price");
      console.log(price);
      const totalPrice =
        web3().utils.toWei(price, "ether") * (endDOY - startDOY);
      rentProperty(id, startDOY, endDOY, totalPrice);
    }
  });

  function createProperty(name, description, price) {
    getBoleroContract();
    const weiValue = web3().utils.toWei(price, "ether");
    boleroContract.methods
      .rentOutproperty(name, description, weiValue)
      .send({ from: account[0] });
    alert("Property created!");
  }

  async function fetchAllProperties() {
    const propertyId = await getBoleroContract().methods.propertyId().call();
    for (let i = 0; i < propertyId; i++) {
      //await getBoleroContract();
      await boleroContract.methods
        .properties(i)
        .call()
        .then(function (res) {
          properties.push({
            id: i,
            name: res.name,
            description: res.description,
            price: metamaskWeb3.utils.fromWei(res.price.toString()),
            owner: res.owner,
          });
        })
        .catch(function (err) {
          console.log("error");
        });
    }
    properties.map(function (property) {
      document.querySelector(".properties").insertAdjacentHTML(
        "beforeend",
        `<div>
          <h2>Name: ${property.name}</h2>
          <p>Description: ${property.description}</p>
          <p id="price-${property.id}" data-price="${property.price}">Price: ${property.price}ETH</p>
          <p>Owner: ${property.owner}</p>
          <label>From</label>
          <input type="date" id="startDay" />
          <label>To</label>
          <input type="date" id="endDay" />
          <button id="book" data-id="${property.id}" class="btn btn-success">Book</button>
        </div>`
      );
    });
    //console.log(properties);
  }
  fetchAllProperties();

  document.querySelector("form").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const description = document.getElementById("description").value;
    const price = document.getElementById("price").value;
    createProperty(name, description, price);
  });
};

export { init };
