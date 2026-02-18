import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';

export default function PrivacyScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy Policy</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.text}>
                    {/* Placeholder for Privacy Policy text. */}
                    Last updated: February 18, 2026{"\n\n"}

                    This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.{"\n\n"}

                    We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy.{"\n\n"}

                    <Text style={styles.bold}>1. Collecting and Using Your Personal Data</Text>{"\n\n"}

                    <Text style={styles.bold}>Types of Data Collected</Text>{"\n\n"}

                    <Text style={styles.bold}>Personal Data</Text>{"\n"}
                    While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You. Personally identifiable information may include, but is not limited to:{"\n"}
                    - Email address{"\n"}
                    - First name and last name{"\n"}
                    - Phone number{"\n"}
                    - Address, State, Province, ZIP/Postal code, City{"\n"}
                    - Usage Data{"\n\n"}

                    <Text style={styles.bold}>Usage Data</Text>{"\n"}
                    Usage Data is collected automatically when using the Service.{"\n"}
                    Usage Data may include information such as Your Device's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that You visit, the time and date of Your visit, the time spent on those pages, unique device identifiers and other diagnostic data.{"\n\n"}

                    <Text style={styles.bold}>2. Use of Your Personal Data</Text>{"\n\n"}
                    The Company may use Personal Data for the following purposes:{"\n"}
                    - To provide and maintain our Service, including to monitor the usage of our Service.{"\n"}
                    - To manage Your Account: to manage Your registration as a user of the Service. The Personal Data You provide can give You access to different functionalities of the Service that are available to You as a registered user.{"\n"}
                    - For the performance of a contract: the development, compliance and undertaking of the purchase contract for the products, items or services You have purchased or of any other contract with Us through the Service.{"\n"}
                    - To contact You: To contact You by email, telephone calls, SMS, or other equivalent forms of electronic communication, such as a mobile application's push notifications regarding updates or informative communications related to the functionalities, products or contracted services, including the security updates, when necessary or reasonable for their implementation.{"\n"}
                    - To provide You with news, special offers and general information about other goods, services and events which we offer that are similar to those that you have already purchased or enquired about unless You have opted not to receive such information.{"\n"}
                    - To manage Your requests: To attend and manage Your requests to Us.{"\n\n"}

                    <Text style={styles.bold}>3. Retention of Your Personal Data</Text>{"\n\n"}
                    The Company will retain Your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use Your Personal Data to the extent necessary to comply with our legal obligations (for example, if we are required to retain your data to comply with applicable laws), resolve disputes, and enforce our legal agreements and policies.{"\n\n"}

                    The Company will also retain Usage Data for internal analysis purposes. Usage Data is generally retained for a shorter period of time, except when this data is used to strengthen the security or to improve the functionality of Our Service, or We are legally obligated to retain this data for longer time periods.{"\n\n"}

                    <Text style={styles.bold}>4. Transfer of Your Personal Data</Text>{"\n\n"}
                    Your information, including Personal Data, is processed at the Company's operating offices and in any other places where the parties involved in the processing are located. It means that this information may be transferred to — and maintained on — computers located outside of Your state, province, country or other governmental jurisdiction where the data protection laws may differ than those from Your jurisdiction.{"\n\n"}

                    Your consent to this Privacy Policy followed by Your submission of such information represents Your agreement to that transfer.{"\n\n"}

                    The Company will take all steps reasonably necessary to ensure that Your data is treated securely and in accordance with this Privacy Policy and no transfer of Your Personal Data will take place to an organization or a country unless there are adequate controls in place including the security of Your data and other personal information.{"\n\n"}

                    <Text style={styles.bold}>5. Contact Us</Text>{"\n\n"}
                    If you have any questions about this Privacy Policy, You can contact us:{"\n"}
                    - By email: ckinstech@gmail.com{"\n"}
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: Colors.background,
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
    },
    content: {
        padding: 24,
    },
    text: {
        fontSize: 16,
        color: Colors.textSecondary,
        lineHeight: 24,
    },
    bold: {
        fontWeight: '700',
        color: Colors.text,
    },
});
