pragma solidity >=0.4.25 <0.6.0;

contract Test {

	Match[] public matches;
	uint matchCount = 0;
	address owner;

	struct Match {
		string name;
		uint bet_amount;
		uint time_limit;
		string description;
 		int8 winningOption;
 		uint start_time;
 		uint time_before_deciding;
 		uint total_money;
 		uint num_players;
 		mapping(uint => address payable) playerID;
 		mapping(address => int8) choice; //initializes to 0, so a user can choose either 1 or 2
	}

	constructor() public {
		owner = msg.sender;
		match_init("First", "First Match", 7, 30);
		match_init("Second", "Second Match", 7, 30);
		match_init("Third", "Third Match", 7, 30);
	}	

	modifier isOwner {
		require(msg.sender == owner);
		_;
	}

	function match_init(string memory _name, string memory _description, uint _bet_amount, uint _time_limit) public {
		Match memory _m = Match(_name, _bet_amount, _time_limit, _description, -1, now, 24 hours * 7, 0, 0);
		matchCount++;
		matches.push(_m);
	}

	function matches_current() public view returns (uint[] memory) {
		uint[] memory _ids = new uint[](matches.length);
		uint counter = 0;

		for(uint i = 0; i < matches.length; i++){
			if(matches[i].winningOption == -1){
				_ids[counter] = i;
				counter++;
			}
		}

		uint[] memory _result_ids = new uint[](counter);
		uint _result_counter = 0;

		for(uint i = 0; i < counter; i++){
			_result_ids[_result_counter] = _ids[i];
			_result_counter++;
		}

		return (_result_ids);
	}

	function check_played_match(uint _match_Id) public view returns(bool) {
		// just to minimize the function
		return !(matches[_match_Id].choice[msg.sender] == 0);
	}

	function matches_wins() public view returns (uint[] memory) {
		uint[] memory _ids = new uint[](matches.length);
		uint counter = 0;

		for(uint i = 0; i < matches.length; i++){
			if(matches[i].choice[msg.sender] == matches[i].winningOption){
				_ids[counter] = i;
				counter++;
			}
		}

		uint[] memory _result_ids = new uint[](counter);
		uint _result_counter = 0;

		for(uint i = 0; i < counter; i++){
			_result_ids[_result_counter] = _ids[i];
			_result_counter++;
		}

		return (_result_ids);
	}

	function matches_lost() public view returns (uint[] memory) {
		uint[] memory _ids = new uint[](matches.length);
		uint counter = 0;

		for(uint i = 0; i < matches.length; i++){
			int8 _player_choice = matches[i].choice[msg.sender];
			if(_player_choice != matches[i].winningOption && matches[i].winningOption != -1 && _player_choice > 0){
				_ids[counter] = i;
				counter++;
			}
		}

		uint[] memory _result_ids = new uint[](counter);
		uint _result_counter = 0;

		for(uint i = 0; i < counter; i++){
			_result_ids[_result_counter] = _ids[i];
			_result_counter++;
		}

		return (_result_ids);
	}

	// You also have to change the payable amount to wei instead of just using ether
	// You likely have to do asynchronous calls for this one since you are sending in a match
	function vote_on_match(int8 _option, uint _match_Id) public payable {
		if(matches[_match_Id].winningOption == -1 && matches[_match_Id].choice[msg.sender] == 0){
			matches[_match_Id].choice[msg.sender] = _option;
			require (msg.value == matches[_match_Id].bet_amount);
			matches[_match_Id].playerID[matches[_match_Id].num_players] = msg.sender;
			matches[_match_Id].num_players++;
			matches[_match_Id].total_money = matches[_match_Id].total_money + msg.value;
		}
	}

	function owner_vote(uint _match_Id, int8 _winning_option) public isOwner {
		matches[_match_Id].winningOption = _winning_option;
		uint _num_winners = 0;

		for(uint i = 0; i < matches[_match_Id].num_players; i++){
			if(matches[_match_Id].choice[matches[_match_Id].playerID[i]] == matches[_match_Id].winningOption){
				_num_winners++;
			}
		}

		uint _money_winning = matches[_match_Id].total_money / _num_winners;

		for(uint i = 0; i < matches[_match_Id].num_players; i++){
			if(matches[_match_Id].choice[matches[_match_Id].playerID[i]] == matches[_match_Id].winningOption){
				address payable curr_address = matches[_match_Id].playerID[i];
				curr_address.transfer(_money_winning);
			}
		}
	}
}