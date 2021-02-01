import * as React from 'react';
import { Text, View, StyleSheet, FlatList, RefreshControl, StatusBar, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons';
type CryptoListState = { coins: Array<any>, refreshing: boolean, selectedCoins: Array<string>};

export default class CryptoList extends React.Component<{}, CryptoListState> {

  bitApi = 'https://api.bittrex.com/v3/markets/tickers';
	
	constructor(props: any){
		super(props);
		this.state = { 
			coins: [],
			selectedCoins: [],
			refreshing: false 
		}
	}

	componentDidMount(){
		this._onRefresh();
	}
	
	_onRefresh() {
		this.setState({refreshing: true});
		fetch(this.bitApi).then((response)=>{
			response.json().then((data)=>{
				this.checkSavedList(data);
      		});
		})
		.catch((err)=>{
			Alert.alert('API failed');
		});
	}

	async checkSavedList(coins: any){
		let savedCoinListStr = await AsyncStorage.getItem('coinList');
		let savedCoinSet: Set<string>;
		let coinList;
		if(savedCoinListStr){
			savedCoinSet = new Set(JSON.parse(savedCoinListStr));
		 	coinList = coins.filter((item: any) => savedCoinSet.has(item.symbol))
		} else {
			coinList = coins;
		}
		this.setState({ 
			refreshing: false,
			coins: coinList,
			selectedCoins: [] 
		});
	}

	pushSelectedCoin(symbol: string){
		let coinList = this.state.selectedCoins;
		if(coinList.indexOf(symbol)<0){
			coinList.push(symbol);
		} else {
			coinList = coinList.filter((coinSymbol)=> coinSymbol !== symbol)
		}
		this.setState({selectedCoins: coinList});
	}

	async saveCoinList(){
		await AsyncStorage.setItem('coinList', JSON.stringify(this.state.selectedCoins));
		this.checkSavedList(this.state.coins);
	}

	async clearCoinList(){
		this.setState({selectedCoins: []});
		await AsyncStorage.removeItem('coinList');
		this._onRefresh();
	}

	_renderItem = ({item}: any) => {
		const isSelected = this.state.selectedCoins.indexOf(item.symbol)>=0;
		const backgroundColor = isSelected ? '#808080' : 'white';
		return (
			<Item
			  item={item}
			  onPress={() => this.pushSelectedCoin(item.symbol)}
			  style={{ backgroundColor }}
			/>
		  );
	};

	renderSeparator = () => {
		return (
			<View
				style={styles.separator}
			/>
		);
	};

	render() {
		return (
      <View style={styles.container}>
		<StatusBar hidden={true} />
		<FlatList        
			refreshControl={
			<RefreshControl
				refreshing={this.state.refreshing}
				onRefresh={this._onRefresh.bind(this)}
			/>}
			keyExtractor={item => item.symbol}
			numColumns={2}
			data={this.state.coins}
			renderItem={this._renderItem}
			ItemSeparatorComponent={this.renderSeparator}
			ListHeaderComponent={<Text style={styles.header}>Bittrex</Text>}
        />
		<View style={styles.floatItem}>
			<View>
				{this.state.selectedCoins.length>0 && <TouchableOpacity
					style={styles.floatButton}
					onPress={()=> this.saveCoinList()}
				>				
					<AntDesign name='save' size={30} color='black' />
				</TouchableOpacity>}
			</View>
			<TouchableOpacity
				style={styles.floatButton}
				onPress={()=> this.clearCoinList()}
			>
				<AntDesign name='delete' size={30} color='black' />
			</TouchableOpacity>
		</View>
      </View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 5
	},
	header:{
		paddingLeft: 20,  
		color: 'white',
		fontWeight: 'bold',
		backgroundColor:'black'
	},
	coinText: {
		flex: 1,
		padding:7
	},
	separator: {
		height: 1,
		width: '100%',
		backgroundColor: 'gray',
	},
	title: {
		fontSize: 20,
		fontWeight: 'bold',
	},
	floatButton: {
		borderWidth:1,
		borderColor:'rgba(0,0,0,0.2)',
		alignItems:'center',
		justifyContent:'center',
		width: 70,      
		height:70,
		backgroundColor:'#fff',
		borderRadius:100,
		zIndex:1,
		margin: 5
	},
	floatItem: {
		right: 10,
		bottom: 10,
		position:'absolute'
	},
	coinItem: {
		borderWidth:1,
		borderColor:'rgba(0,0,0,0.2)',
	}
});

const Item = ({ item, onPress, style }: any) => {
	const coin = item.symbol;
	return (
		<TouchableOpacity onPress={onPress} style={[styles.coinItem,style]}>
			<Text style={styles.coinText}>{coin} - {item['lastTradeRate']}</Text>
		</TouchableOpacity>  
	  )
};