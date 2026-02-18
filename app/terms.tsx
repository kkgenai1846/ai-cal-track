import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';

export default function TermsScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Terms & Conditions</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.text}>
                    {/* Placeholder for ~1500 words. Using a shorter version for brevity in this example, but structurally ready for long text. */}
                    Last updated: February 18, 2026{"\n\n"}

                    Please read these terms and conditions carefully before using Our Service.{"\n\n"}

                    <Text style={styles.bold}>1. Interpretation and Definitions</Text>{"\n\n"}

                    <Text style={styles.bold}>Interpretation</Text>{"\n"}
                    The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.{"\n\n"}

                    <Text style={styles.bold}>Definitions</Text>{"\n"}
                    For the purposes of these Terms and Conditions:{"\n"}
                    - Application means the software program provided by the Company downloaded by You on any electronic device, named AI Cal Track.{"\n"}
                    - Application Store means the digital distribution service operated and developed by Apple Inc. (Apple App Store) or Google Inc. (Google Play Store) in which the Application has been downloaded.{"\n"}
                    - Affiliate means an entity that controls, is controlled by or is under common control with a party, where "control" means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.{"\n"}
                    - Account means a unique account created for You to access our Service or parts of our Service.{"\n"}
                    - Country refers to: California, United States{"\n"}
                    - Company (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to AI Cal Track.{"\n"}
                    - Device means any device that can access the Service such as a computer, a cellphone or a digital tablet.{"\n"}
                    - Service refers to the Application.{"\n"}
                    - Terms and Conditions (also referred as "Terms") mean these Terms and Conditions that form the entire agreement between You and the Company regarding the use of the Service.{"\n"}
                    - Third-party Social Media Service means any services or content (including data, information, products or services) provided by a third-party that may be displayed, included or made available by the Service.{"\n"}
                    - You means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.{"\n\n"}

                    <Text style={styles.bold}>2. Acknowledgment</Text>{"\n\n"}
                    These are the Terms and Conditions governing the use of this Service and the agreement that operates between You and the Company. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.{"\n\n"}

                    Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms and Conditions apply to all visitors, users and others who access or use the Service.{"\n\n"}

                    By accessing or using the Service You agree to be bound by these Terms and Conditions. If You disagree with any part of these Terms and Conditions then You may not access the Service.{"\n\n"}

                    You represent that you are over the age of 18. The Company does not permit those under 18 to use the Service.{"\n\n"}

                    Your access to and use of the Service is also conditioned on Your acceptance of and compliance with the Privacy Policy of the Company. Our Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your personal information when You use the Application or the Website and tells You about Your privacy rights and how the law protects You. Please read Our Privacy Policy carefully before using Our Service.{"\n\n"}

                    <Text style={styles.bold}>3. Links to Other Websites</Text>{"\n\n"}
                    Our Service may contain links to third-party web sites or services that are not owned or controlled by the Company.{"\n\n"}

                    The Company has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third party web sites or services. You further acknowledge and agree that the Company shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods or services available on or through any such web sites or services.{"\n\n"}

                    We strongly advise You to read the terms and conditions and privacy policies of any third-party web sites or services that You visit.{"\n\n"}

                    <Text style={styles.bold}>4. Termination</Text>{"\n\n"}
                    We may terminate or suspend Your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if You breach these Terms and Conditions.{"\n\n"}
                    Upon termination, Your right to use the Service will cease immediately.{"\n\n"}

                    <Text style={styles.bold}>5. Limitation of Liability</Text>{"\n\n"}
                    Notwithstanding any damages that You might incur, the entire liability of the Company and any of its suppliers under any provision of this Terms and Your exclusive remedy for all of the foregoing shall be limited to the amount actually paid by You through the Service or 100 USD if You haven't purchased anything through the Service.{"\n\n"}
                    To the maximum extent permitted by applicable law, in no event shall the Company or its suppliers be liable for any special, incidental, indirect, or consequential damages whatsoever (including, but not limited to, damages for loss of profits, loss of data or other information, for business interruption, for personal injury, loss of privacy arising out of or in any way related to the use of or inability to use the Service, third-party software and/or third-party hardware used with the Service, or otherwise in connection with any provision of this Terms), even if the Company or any supplier has been advised of the possibility of such damages and even if the remedy fails of its essential purpose.{"\n\n"}
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
