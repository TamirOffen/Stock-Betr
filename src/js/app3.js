App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Test.json", function(test) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Test = TruffleContract(test);
      // Connect provider to interact with contract
      App.contracts.Test.setProvider(App.web3Provider);

      return App.render();
    });
  },

  render: function() {
    var test_instance;

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#user_address").html(account);
      }
    });

    App.contracts.Test.deployed().then(function(instance){
      test_instance = instance;
      var urlParams = new URLSearchParams(window.location.search);
      match_index = urlParams.get("myVar1");
      return test_instance.matches_current();
      }).then(async function(uint_list){
        var currIndex = uint_list[match_index-1];
        var currMatch = await test_instance.matches(currIndex);
        console.log(currMatch);
        $("#Name").html(currMatch[0]);
        $("#Description").html(currMatch[3]);
        $("#EthereumCost").html("Ethereum: " + currMatch[1].toNumber().toString());
      });
  },

  vote: function(index) {
    var test_instance;
    App.contracts.Test.deployed().then(function(instance){
      var urlParams = new URLSearchParams(window.location.search);
      match_index = urlParams.get("myVar1");
      test_instance = instance;
      console.log("Match Index: " + match_index.parseInt-1);
      console.log("Choice Index: " + index);
      test_instance.vote_on_match(index, match_index-1, {from: App.account, value: 7});
    });
  },
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});