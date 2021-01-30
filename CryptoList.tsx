import * as React from 'react';
import { Text, View, StyleSheet, FlatList, RefreshControl, StatusBar, Alert } from 'react-native';
type CryptoListState = { bitbnsData: Array<any>, refreshing: boolean};

export default class CryptoList extends React.Component<{}, CryptoListState> {

  bitbnsApi = 'https://bitbns.com/order/getTickerAll';

	
	constructor(props: any){
    super(props);
		this.state = { 
      bitbnsData: [],
			refreshing: false }
	}

	componentDidMount(){
		this._onRefresh();
	}
	
	_onRefresh() {
		this.setState({refreshing: true});
		fetch(this.bitbnsApi).then((response)=>{
			response.json().then((data)=>{
				let coinList: Array<any> = [];
				data.forEach((item: any)=>{
					let [coin, details] = Object.entries(item)[0] as any;
					if(coin.match('USDT')){
						details.id = coin;
						coinList.push(details);
					}
				})
				this.setState({ refreshing: false,
								bitbnsData: coinList });
      		});
		})
		.catch((err)=>{
			 Alert.alert('Bitbns api failed');
		});
	}


	_renderItem = ({item}: any) => {
		const coin = item.id;
		return (<Text style={styles.coin}>{coin} - {item['lastTradePrice']}</Text>)
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
					keyExtractor={item => item.id}
					numColumns={2}
					data={this.state.bitbnsData}
					renderItem={this._renderItem}
                    ItemSeparatorComponent={this.renderSeparator}
                    ListHeaderComponent={<Text style={styles.header}>BitBnS</Text>}
        />
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
    color: "white",
    fontWeight: 'bold',
    backgroundColor:'#00000f'
  },
  coin: {
    flex: 1,
    padding:8,
  },
  separator: {
    height: 1,
    width: "100%",
    backgroundColor: "#CED0CE",
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  }
});
