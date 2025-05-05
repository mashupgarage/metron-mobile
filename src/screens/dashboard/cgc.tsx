import { ScrollView } from "react-native";
import { Box } from "@/src/components/ui/box";
import { Text } from "@/src/components/ui/text";
import { Image } from "@/src/components/ui/image";
import { useColorScheme } from "react-native";
import { HStack } from "@/src/components/ui/hstack";
import { Button } from "@/src/components/ui/button";
import { ButtonText } from "@/src/components/ui/button";
import { Menu } from "lucide-react-native";
import {
  NavigationProp,
  useNavigation,
  DrawerActions,
} from "@react-navigation/native";
import { DashboardStackParams } from "@/src/utils/types/navigation";

export default function CGC() {
  const navigation = useNavigation<NavigationProp<DashboardStackParams>>();
  const colorScheme = useColorScheme();
  
  return (
    <Box className="h-screen w-full pb-10">
      <HStack className="justify-start pt-12 pr-2">
        <Box className="p-2">
          <Button
            onPress={() => {
              navigation.dispatch(DrawerActions.toggleDrawer());
            }}
            variant="link"
          >
            <Menu
              size={24}
              color={colorScheme === "dark" ? "#FFFFFF" : "#202020"}
            />
          </Button>
        </Box>
      </HStack>
      <ScrollView>
        <Box>
          <Box className="items-center justify-center my-4">
            <Image
              source={require("@/src/assets/cgc-faq.png")}
              alt="CGC FAQ"
              className="w-full h-64 rounded-lg"
              resizeMode="contain"
            />
          </Box>

          <Box className="items-center justify-center mx-6 my-6">
            <Button
              onPress={() => {
                navigation.navigate("CGCSubmit");
              }}
              className="w-full rounded-full bg-blue-800 border-2 border-red-500"
            >
              <ButtonText className="text-white text-lg font-semibold">Submit your books</ButtonText>
            </Button>
          </Box>
          
          <Box className="px-4">
            <Text className="text-xl font-bold mb-4">THE BASICS</Text>
            
            <Text className="font-bold mb-2">What is CGC?</Text>
            <Text className="mb-4">Certified Guaranty Company® (CGC®) is the world's largest and most trusted third-party grading service for comics, trading cards, magazines, concert posters and related collectibles, with more than 6 million collectibles certified since 2000.</Text>
            
            <Text className="font-bold mb-2">What is Grading?</Text>
            <Text className="mb-4">Each submitted comic book is evaluated and documented by CGC's in-house experts and assigned a numerical value from 1-10 (with 10 being the highest), based on its physical condition.</Text>
            
            <Text className="font-bold mb-2">What is Slabbing?</Text>
            <Text className="mb-4">Slabbing is the process of encapsulating your graded comic book with an easy-to-understand label that contains all relevant information on that particular item. The label features a comprehensive description of the collectible along with its CGC grade and unique CGC certification number.</Text>
            
            <Text className="font-bold mb-2">What are the different kinds of labels?</Text>
            <Text className="mb-4">CGC has different labels for different kinds of books. Some of the more commonly utilized labels are:</Text>
            
            <Text className="mb-2"><Text className="font-bold">BLUE LABEL (Universal)</Text> – The book has been submitted as is, with no qualifiers or special conditions – it has not been modified from its original published state.</Text>
            
            <Text className="mb-2"><Text className="font-bold">YELLOW LABEL (CGC Signature)</Text> - This label is applied to collectibles that have been signed by someone of significance to the collectible, under the direct observation of a CGC authorized witness, and are thus certified by CGC as having an authentic signature. In select instances, CGC may accept signed collectibles directly from the signer/publisher. The signatures are then authenticated by CGC with labels indicating who signed them, when they were signed and, in some cases, where they were signed.</Text>
            
            <Text className="mb-2"><Text className="font-bold">GREEN LABEL (Qualified)</Text> - A Qualified label is used by CGC for collectibles that have a significant defect that needs specific description, or to note an unauthenticated signature (one which was not witnessed by CGC). For example, a comic book with a missing coupon that otherwise grades 6.0 will receive a Qualified grade, avoiding a considerably lower grade. CGC would give this book a Qualified grade of 6.0 and a Label Text notation "COUPON MISSING FROM PAGE 10, DOES NOT AFFECT STORY." Or, if the book is signed on the cover it may be noted as "NAME WRITTEN ON COVER IN MARKER."</Text>
            
            <Text className="mb-2"><Text className="font-bold">PURPLE LABEL (Restored)</Text> - This label is applied to any comic book that has evidence of repair so that it will appear as it did when it was in its original condition. Restoration can come in a variety of degrees, from slight professional restoration (A-1) to extensive amateur restoration (C-5).</Text>
            
            <Text className="mb-2"><Text className="font-bold">NG LABEL (No Grade)</Text> – This label stands for "No Grade" and is assigned to comics that are either missing the entire cover, or one half or more of the interior pages, or both. It may also be assigned to comics that are only being verified as authentic, per CGC's discretion.</Text>
            
            <Text className="text-xl font-bold mt-6 mb-4">SERVICES & EVENTS</Text>
            
            <Text className="font-bold mb-2">Will Comic Odyssey be hosting signing events?</Text>
            <Text className="mb-4">While under community quarantine, we will not be hosting any public signings, but stand by for announcements of private signings!</Text>
            
            <Text className="font-bold mb-2">Do you accept cards for grading?</Text>
            <Text className="mb-4">Comic Odyssey does not offer this service yet, but please watch out for announcements!</Text>
            
            <Text className="font-bold mb-2">Do you offer pressing/restoration services?</Text>
            <Text className="mb-4">CGC does not perform pressing, dry cleaning, restoration, restoration removal or any similar treatments for comic books. These and other services are available from their affiliated company, Classic Collectible Services. If you wish to avail of these services, you may note the same in your submission form and the fees for such services will be added to your final total accordingly. Please note that the availment of some services can affect the turnaround times for the return of your book(s).</Text>
            
            <Text className="text-xl font-bold mt-6 mb-4">QUALIFICATIONS FOR GRADING</Text>
            
            <Text className="font-bold mb-2">Can I get unsigned books graded by CGC?</Text>
            <Text className="mb-4">Yes, unsigned books may be graded under the BLUE LABEL.</Text>
            
            <Text className="font-bold mb-2">Can I get previously-signed books authenticated by CGC?</Text>
            <Text className="mb-4">CGC does not offer this service.</Text>
            
            <Text className="font-bold mb-2">Can I get previously-signed books graded?</Text>
            <Text className="mb-4">Previously-signed, ungraded books can be submitted for grading, but any existing signatures will be listed as "NAME WRITTEN ON COVER IN MARKER", and identified as an existing defect that will lower the overall grade under BLUE LABEL. If you do not wish for the signature to negatively affect the grading, you may avail of the "Qualified" or GREEN LABEL.</Text>
            
            <Text className="font-bold mb-2">Can I get signatures added to previously-graded/slabbed books and have it re-graded/re-slabbed?</Text>
            <Text className="mb-4">Previously-CGC slabbed books may be removed ("cracked") from the slab and submitted for signing and re-grading, ONLY if a CGC witness is present when the case is cracked. The previous label would need to be included in the submission. *There is no guarantee that the original grade will be retained once the book is removed from the original slab.</Text>
            
            <Text className="font-bold mb-2">I have an existing Certificate of Authenticity (COA). Will CGC recognize it?</Text>
            <Text className="mb-4">CGC does not accept COA's as proof of signature as they are easily forged. We recommend that you keep possession of your COA as they will not be recognized or encapsulated with your book. There is also no guarantee that your COA will be returned with your book should it be included.</Text>
            
            <Text className="font-bold mb-2">Can I have sealed poly-bagged books certified by CGC?</Text>
            <Text className="mb-4">To have a poly-bagged book certified by CGC, you must remove the book from its poly-bag or send written approval authorizing CGC to remove it. The words "Poly-bag removed" will appear on the CGC label.</Text>
            
            <Text className="text-xl font-bold mt-6 mb-4">SUBMISSIONS</Text>
            
            <Text className="font-bold mb-2">How do I submit my books/where can I submit my books?</Text>
            <Text className="mb-4">After filling up the online submission form, a confirmation email will be sent to you with your payable amount. Please present this upon drop off of your books at your chosen branch – your books will not be accepted without prior submission of the online form and minimum 50% downpayment.</Text>
            
            <Text className="font-bold mb-2">How much does our CGC grading cost?</Text>
            <Text className="mb-4">The total cost depends on the services availed, the type of event (i.e. private signing with specific artist) and the number of books submitted. The value and category of the books being submitted, the tiers (labels) and turnaround times you select, and shipping, will also affect the cost.</Text>
            
            <Text className="font-bold mb-2">How do I pay?</Text>
            <Text className="mb-4">At the moment, we are operating on a CASH ONLY basis, with a minimum 50% downpayment to be made at the Comic Odyssey branch upon submission of your books. A confirmation email will be sent to you to verify that your books have been submitted.</Text>
            
            <Text className="mb-4">Generally, a minimum of 50% downpayment would be required upon submission of your book(s). A confirmation email will then be sent to you to verify that your books have been submitted.</Text>
            
            <Text className="font-bold mb-2">How do I follow up on my submitted books?</Text>
            <Text className="mb-4">You may email grading@comic-odyssey.com or message us at @gradingph on Facebook during business hours.</Text>
            
            <Text className="font-bold mb-2">Are my submitted books insured?</Text>
            <Text className="mb-4">CGC dictates that they assume no risk of loss or damage during the return shipment from them to us. To cover that, our team will utilize the standard courier insurance for shipping. To that end, for insurance purposes and whenever applicable, we will properly declare the correct value of the books, which may also affect costs.</Text>
            
            <Text className="font-bold mb-2">How long does it take for my books to be returned?</Text>
            <Text className="mb-4">Turnaround times vary, depending on the services availed.</Text>
            
            <Text className="mb-4">While dates are normally provided with respect to the turnaround times, please do note that these are only estimates. Due to the logistics of international shipping, there may be factors beyond our control which may invariably shorten or lengthen turnaround times.</Text>
            
            <Text className="mb-4">Rest assured, however, that we will be working to mitigate these factors as much as possible so that we are able to stick to the estimated turnaround times.</Text>
            
            <Text className="italic mt-6 mb-2">NOTE: These FAQs are meant to serve merely as guidance. They can also be subject to amendments.</Text>
            
            <Text className="mb-8 font-bold">For more information on the grading services, please do not hesitate to contact us via email at grading@comic-odyssey.com, or message us at @gradingph on Facebook during business hours.</Text>
          
            <Box className="items-center justify-center mx-6 my-6">
              <Button
                onPress={() => {
                  navigation.navigate("CGCSubmit");
                }}
                className="w-full rounded-full bg-blue-800 border-2 border-red-500"
              >
                <ButtonText className="text-white text-lg font-semibold">Submit your books</ButtonText>
              </Button>
            </Box>

          </Box>
        </Box>
      </ScrollView>
    </Box>
  );
} 