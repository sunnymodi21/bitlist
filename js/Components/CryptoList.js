import React from 'react';
import { StyleSheet, Text, View, FlatList, RefreshControl, StatusBar } from 'react-native';

export default class CryptoList extends React.Component {
	bitbnsApi = 'https://bitbns.com/order/getTickerAll';
	_keyExtractor = (item, index) => item.id=index;
	
	constructor(){
		super();
		this.state = { bitbnsData: [],
						refreshing: false }
	}

	componentDidMount(){
		this._onRefresh();
	}
	
	_onRefresh() {
		this.setState({refreshing: true});
		fetch(this.bitbnsApi).then((response)=>{
			response.json().then((data)=>{
				this.setState({ refreshing: false,
								bitbnsData:data });
      		});
		})
		.catch((err)=>{
			 Alert.alert('Bitbns api failed');
		});
	}


	_renderItem = ({item}) => {
		const coin = Object.keys(item)[0];
		return (<Text style={styles.coin}>{coin} - {item[coin]['sellPrice']}</Text>)
	};

	renderHeader = () => {
    	return <Text style={styles.header}>BitBnS</Text>;
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
					style={styles.wrapList}
					numColumns={2}
					data={this.state.bitbnsData}
					keyExtractor={this._keyExtractor}
					renderItem={this._renderItem}
					ItemSeparatorComponent={this.renderSeparator}
					ListFooterComponent={this.renderFooter}
					ListHeaderComponent={this.renderHeader}
				/>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
	flex: 1
	},
	header:{
		fontWeight: 'bold',
		backgroundColor:'#CED0CE'
	},
	coin: {
		flex: 1,
		padding:8,
	},
	separator: {
		height: 1,
		width: "100%",
		backgroundColor: "#CED0CE",
	}
});