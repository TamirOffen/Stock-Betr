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

    // Load wins table
    App.contracts.Test.deployed().then(function(instance) {
      test_instance = instance;
      return test_instance.matches_wins();
      }).then(function(uint_list){
        var output_html = "";
        uint_list.forEach(async function(item, i){
          var inst = await test_instance.matches(item.toNumber());
          output_html = ("<tr><th scope=\"row\">" + item.toNumber() + "</th> <td>" + inst[0] + "</td> <td>" + inst[1] + "</td> </tr>");
          $("#wins_table").append(output_html);
        });
      });

    // Load losses table
    App.contracts.Test.deployed().then(function(instance) {
      return instance.matches_lost();
      }).then(async function(uint_list){
        var output_html = "";
        uint_list.forEach(async function(item, i){
          var inst = await test_instance.matches(item.toNumber());
          output_html = ("<tr><th scope=\"row\">" + item.toNumber() + "</th> <td>" + inst[0] + "</td> <td>" + inst[1] + "</td> </tr>");
          $("#losses_table").append(output_html);
          });
    });

  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});