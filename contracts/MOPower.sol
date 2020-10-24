pragma solidity >=0.5.10 <0.6.0;
pragma experimental ABIEncoderV2;

/** 
 * @title MOPower
 * @dev Implements meter transactions and consumption on immutable ledger
 */
contract MOPower {
    
    address private owner;
    
    /** 
     * @dev Check if caller is owner
     */
    modifier isOwner() {
        // If the first argument of 'require' evaluates to 'false', execution terminates and all
        // changes to the state and to Ether balances are reverted.
        // This used to consume all gas in old EVM versions, but not anymore.
        // It is often a good idea to use 'require' to check if functions are called correctly.
        // As a second argument, you can also provide an explanation about what went wrong.
        require(msg.sender == owner, "Caller is not owner");
        _;
    }
    
    /** 
     * @dev Initialize contract and set owner as sender
     */
    constructor () public {
        owner = msg.sender;
    }
    
    Producer[] producers;
    Consumer[] consumers;
    EnergyConsumption[] energyUsages;
    
    // list of all meters mapped by their unique id
    mapping(uint => Meter) private meters_map;
    // list of all transactions mapped by their reference
    mapping(uint => Transaction) private transactions_map;
    // list of all transactions done on a meter
    mapping(uint => Transaction[]) private meterTransactions_map;
    // list of all energy consumed by a meter
    mapping(uint => EnergyConsumption[]) private meterConsumptions_map;
    
    event meterSaved(uint _meterId, uint _consumerId, string _message);
    event consumerSaved(uint _consumerId, string _message);
    event producerSaved(uint _producerId, string _message);
    event transactionSaved(string _token, string _message);
    event consumptionSaved(uint _meterId, uint _usedUnits, string _message);
    
    event meterTrasactionsFetched(Transaction[] _transactions, string _message);
    event trasactionFetched(Transaction _transaction, string _message);
    
    event meterCountUpdated(string _message);

    
    // sells energy tokens for meter
    struct Producer {
        uint64 id;
        uint64 currentPrice; //in kobo
    }
    
    // buys energy token for meter
    struct Consumer {
        uint64 id;
        uint8 meterCount;
    }
    
    // smart meters owned by consumers
    struct Meter {
        uint64 id;
        uint64 unitBalance;
        uint64 consumerId;
    }
    
    // meter token transaction
    struct Transaction {
        uint id;
        uint96 meterId;
        string token;
        uint64 consumerId;
        uint64 producerId;
        uint64 unitsBought;
        uint256 price; // (current) price in kobo when unit was purchase
        uint transactionTimestamp;
    }
    
    // smart meter energy consumption
    struct EnergyConsumption {
        uint id;
        uint meterId;
        uint usedUnits;
    }
    
    /** 
     * @dev Save new meter on chain
     * @param _meter The details of the new meter
     */
     //@emit (meterId, consumerId, "meter added successfully")
    function addMeter (Meter memory _meter) public isOwner{
        require(_meter.consumerId > 0, "no existing customer for meter");
        meters_map[_meter.id] = _meter;
        
        // increase meters owned by consumer
        updateConsumerMeterCount(_meter.consumerId);
        
        emit meterSaved(_meter.id, _meter.consumerId, "meter added successfully");
    }
    
    /** 
     * @dev Save new consumer on chain
     * @param _consumer The details of the new consumer
     */
     //@emit (consumerId, "consumer added successfully")
    function addConsumer (Consumer memory _consumer) public isOwner {
        uint _consumerId = consumers.push(_consumer);
        Consumer memory consumer = consumers[_consumerId - 1];
        
        emit consumerSaved(consumer.id, "consumer added successfully");
    }
    
    /** 
     * @dev Save new energy producer on chain
     * @param _producer The details of the new producer
     */
     //@emit (producerId, "producer added successfully")
    function addProducer (Producer memory _producer) public isOwner {
        uint _producerId = producers.push(_producer);
        Producer memory producer = producers[_producerId - 1];
        
        emit producerSaved(producer.id, "producer added successfully");
    }
    
    /** 
     * @dev save transaction of token loaded to smart meter. This is saved to the meter's transaction history
     * @param _transaction The details of the new transaction, including the meter id
     */
     //@emit (used transaction token, "transaction added successfully")
    function addTransaction(Transaction memory _transaction) public isOwner {
        
        require(meterExists(_transaction.meterId), "meter does not exist");
        meterTransactions_map[_transaction.meterId].push(_transaction);
        
        emit transactionSaved(_transaction.token, "transaction added successfully");
    }
    
    /** 
     * @dev save new meter energy consumption
     * @param _consumption The details of the new inbound energy consumption of a smart meter
     */
    //@emit (meterId, unitsConsumed, "consumption saved successfully")
    function addConsumption(EnergyConsumption memory _consumption) public isOwner {
        require(meterExists(_consumption.meterId), "meter does not exist");
        meterConsumptions_map[_consumption.meterId].push(_consumption);
        
        emit consumptionSaved(_consumption.meterId, _consumption.usedUnits, "consumption saved successfully");
    }
    
    /** 
     * @dev increase consumer meters count by one when they acquire new smart meter
     * @param _consumerId The id of the consumer who just acquired a new smart meter
     */
     //@emit ("consumer meter count updated")
    function updateConsumerMeterCount (uint _consumerId) private {
        Consumer storage consumer = consumers[_consumerId - 1];
        consumer.meterCount += 1;
        
        emit meterCountUpdated("consumer meter count updated");
    }
    
    /** 
     * @dev Checks if meter exists on blockchain
     * @param _meterId The id of the meter
     */
    function meterExists(uint _meterId) private view returns(bool){
        if(_meterId > 0 && meters_map[_meterId].id > 0){
            return false;
        }
        return true;
    }
    
    /** 
     * @dev fetch all the token transactions made for a particular meter
     * @param _meterId The id of the meter whose transaction history is required
     * @return _meterTransations An array of transactions mapped by the meterId
     */
    function getMeterTransactions(uint _meterId) public returns (Transaction[] memory _meterTransactions){
        _meterTransactions = meterTransactions_map[_meterId];
        
        string memory msg = "meter transactions fetched successfully";
        if(_meterTransactions.length == 0)
            msg = "transactions not found";
        
        emit meterTrasactionsFetched(_meterTransactions, msg);
    }
    
     /** 
     * @dev fetch details of single meter token Transaction
     * @param _transactionId The id of the transaction to be fetched
     * @param _meterId The id of the meter that owns transaction
     * @return _transaction Transaction details
     */
    function getTransaction(uint _transactionId, uint _meterId) public returns (Transaction memory _transaction){
        Transaction[] memory _meterTransactions = getMeterTransactions(_meterId);
        
        // transaction search is more likely to be for recent transactions
        for(uint i=_meterTransactions.length - 1; i >= 0; i--){
            if(_meterTransactions[i].id == _transactionId){
                _transaction = _meterTransactions[i];
                break;
            }
        }
        string memory msg = "meter transaction fetched successfully";
        
        if(_transaction.id<1)
            msg = "transaction not found";
        
        emit trasactionFetched(_transaction, msg);
    }
}