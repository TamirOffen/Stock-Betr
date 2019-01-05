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
      return test_instance.matches_current();
      //TODO: do the boolean check if finished or not finished for the betting options (the current)
    }).then(async function(uint_list){
      var m_1 = await test_instance.matches(uint_list[0].toNumber()); 
      var m_2 = await test_instance.matches(uint_list[1].toNumber());
      var m_3 = await test_instance.matches(uint_list[2].toNumber());
      // test_instance.matches(uint_list[0].toNumber()).then(function(i){m_1 = i});
      // test_instance.matches(uint_list[1].toNumber()).then(function(i){m_2 = i});
      // test_instance.matches(uint_list[2].toNumber()).then(function(i){m_3 = i});
      $("#first_name").html(m_1[0].toString());
      $("#second_name").html(m_2[0].toString());
      $("#third_name").html(m_3[0].toString());
      var finished_1 = await test_instance.check_played_match(uint_list[0].toNumber());
      var finished_2 = await test_instance.check_played_match(uint_list[1].toNumber());
      var finished_3 = await test_instance.check_played_match(uint_list[2].toNumber());
      // test_instance.check_played_match(uint_list[0].toNumber()).then(function(i){finished_1 = i});
      // test_instance.check_played_match(uint_list[1].toNumber()).then(function(i){finished_2 = i});
      // test_instance.check_played_match(uint_list[2].toNumber()).then(function(i){finished_3 = i});
      console.log("first: " + finished_1 + " second: " + finished_2 + "third: " + finished_3);
      if(finished_1 == true){
        $("#first_completed").html("Completed");
        $("#first_button").attr("disabled", "disabled");
        $("#first_button").attr("href", "");
      }
      if(finished_2 == true){
        $("#second_completed").html("Completed");
        $("#second_button").attr("disabled", "disabled");
        $("#second_button").attr("href", "");

      }
      if(finished_3 == true){
        $("#third_completed").html("Completed");
        $("#third_button").attr("disabled", "disabled");
        $("#third_button").attr("href", "");
      }
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});