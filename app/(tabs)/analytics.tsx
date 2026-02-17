import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/Colors';

export default function AnalyticsScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Analytics</Text>
                <Text style={styles.text}>Your progress stats will appear here.</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 16,
    },
    text: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
});
