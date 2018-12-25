const puppeteer = require('puppeteer');
const date = require('date-and-time');

module.exports = {
    run: async function(address, city, state, zip, detail) {
        var {first, last, birth, home_age, alarm_system, roofless, rooftype, havepool, dog, basement, bundlehome, flood, settlementdate} = detail;
        const browser = await puppeteer.launch(
            {args: ['--no-sandbox', '--disable-setuid-sandbox']}
        );
        const page = await browser.newPage();

        await page.goto('https://thekey.contributionship.com/');
        //----------------Log in part-----------------------//
        const USERNAME_SELECTOR = '#j_username';
        const PASSWORD_SELECTOR = '#j_password';
        const BUTTON_SELECTOR = '#SignIn';
        await page.waitFor(5000);
        await page.click(USERNAME_SELECTOR);
        await page.keyboard.type('peterhughes');

        await page.click(PASSWORD_SELECTOR);
        await page.keyboard.type('Iverson23');

        await page.click(BUTTON_SELECTOR);

        await page.waitForNavigation();
        console.log("login passed");
        //----------------Getting into pages-------------------//
        await page.click('#NewQuote');
        await page.waitFor(2000);
        await page.click('#ProductSelection input');
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        
        var yyyy = today.getFullYear();
        if(dd<10){
            dd='0'+dd;
        }
        else if(dd<20){
          dd += 10;
        }
        if(mm<10){
            mm='0'+mm;
        } 
        today = mm+'/'+dd+'/'+yyyy;
        await page.keyboard.type(today);
        await page.select('#ProductSelection select', 'PA');
        await page.click("#Continue");
        await page.waitFor(2000);
        await page.click('#ProductSelectionList a');

        await page.waitForNavigation();

        await page.waitFor(3000);

        console.log("second page passed");
        await page.select('#Question_VacantOccupied', 'NO');
        await page.select('#Question_ActiveKnobTube', 'NO');
        await page.select('#Question_ScrewInFuses', 'NO');
        await page.select('#Question_AluminumWiring', 'NO');
        await page.select('#Question_PrimaryHeatSource', 'NO');
        await page.select('#Question_SecondaryHeatSource', 'NO');
        await page.select('#Question_PelletStove', 'NO');
        await page.select('#Question_MobileHomeTrailer', 'NO');
        await page.select('#Question_ModularHome', 'NO');
        await page.select('#Question_LandLeasedToBusinessEntity', 'NO');
        await page.select('#Question_CorporationPartnershipLLC', 'NO');
        await page.select('#Question_AdjacentWarehouses', 'NO');
        await page.select('#Question_Trampolines', 'NO');
        await page.select('#Question_PoolHotTub', 'NO');
        await page.select('#Question_SyntheticStuccoEIFS', 'NO');
        await page.select('#Question_WholeLog', 'NO');
        await page.select('#Question_SeasonalRental', 'NO');
        await page.select('#Question_BiteHistory', 'NO');
        await page.select('#Question_NewPurchase', 'YES');

        await page.click('#NextPage');
        await page.waitForNavigation();

        await page.waitFor(3000);
        console.log("third page passed");

        await page.evaluate(() => {
            $('#PolicyGeneral select:eq(0) option:eq(2)').prop('selected', true);
            return;
        });
        await page.waitFor(2000);
        await page.evaluate(() => {
            $('#PolicyGeneral select:eq(2) option:eq(1)').prop('selected', true);
            $('#InsuredInformation select:eq(0) option:eq(1)').prop('selected', true);
            $('#Insured\\.EntityTypeCd select:eq(0) option:eq(1)').prop('selected', true);
            $('#Insured\\.EntityTypeCd').trigger('onchange');
        });
        await page.waitForNavigation();
        await page.waitFor(3000);

        var firstname = first;
        var lastname = last;
        var birthday = birth;
        var user_address= address;
        var user_city = city;
        var user_zip = zip;
        await page.evaluate(() => {
            $('#InsuredInformation select:eq(1) option:eq(2)').prop('selected', true);
            $('#InsuredInformation select:eq(2) option:eq(5)').prop('selected', true);
            $('#InsuredInformation select:eq(3) option:eq(5)').prop('selected', true);
            $('#InsuredInformation select:eq(4) option:eq(1)').prop('selected', true);
            $('#InsuredInformation select:eq(5) option:eq(39)').prop('selected', true);
            $('#InsuredInformation select:eq(8) option:eq(1)').prop('selected', true);
            $('#InsuredInformation select:eq(10) option:eq(2)').prop('selected', true);
        });
        await page.click('#InsuredName\\.GivenName', {clickCount: 3});
        await page.keyboard.type(firstname);
        await page.click('#InsuredName\\.Surname', {clickCount: 3});
        await page.keyboard.type(lastname);
        await page.click('#ResetCommercialName');
        await page.click('#InsuredPersonal\\.BirthDt');
        var buf = birthday.split('-');
        birthday = buf[1] + '/' + buf[2] + '/' + buf[0];
        await page.keyboard.type(birthday);
        await page.click('#InsuredResidentAddr\\.Addr1');
        await page.keyboard.type(user_address.address);
        await page.click('#InsuredResidentAddr\\.City');
        await page.keyboard.type(user_city.city);
        console.log(user_city.city);
        await page.click('#InsuredResidentAddr\\.PostalCode');
        await page.keyboard.type(user_zip.zip);
        await page.click('#InsuredPhonePrimary\\.PhoneNumber');
        await page.keyboard.type("610-699-9000");
        await page.evaluate(() => {
            $('#InsuredInformation input[type=checkbox]:eq(0)').click();
            toggleCheckBox('Building.NoPriorAddressInd');
            $('#InsuredInformation input[type=text]:eq(19)').val("none");
            $('#InsuredInformation img:eq(1)').click();
            InsuredResidentAddr.verify();
            $('#DefaultAddress').click();
            InsuredMailingAddr.verify();
            $('#InsuredInformation img:eq(2)').click();
            $('#LaunchMSBRCT').click();
        });
        await page.waitForNavigation();

        await page.waitFor(4000);
        await page.evaluate(() => {
            $('input[type=radio]:eq(0)').click();
        })
        await page.click('#LaunchMSBRCT');

        await page.waitFor(10000);
        console.log("redirect to another page passed");

        var pages = await browser.pages();

        console.log(pages.map(page => page.url()));
        await pages[2].close();

        await page.waitFor(4000);
        console.log("closing other tab passed");
        await page.evaluate(() => {
            $('#HomeownersGeneral select:eq(0) option:eq(3)').prop('selected', true);
            $('#HomeownersGeneral select:eq(1) option:eq(1)').prop('selected', true);
            $('#HomeownersGeneral select:eq(2) option:eq(4)').prop('selected', true);
            $('#HomeownersGeneral select:eq(3) option:eq(1)').prop('selected', true);
            $('#HomeownersGeneral select:eq(4) option:eq(1)').prop('selected', true);
            $('#HomeownersGeneral select:eq(5) option:eq(1)').prop('selected', true);

            $('#HomeownersGeneral input[type=text]:eq(2)').val('2003');
            $('#HomeownersGeneral input[type=text]:eq(3)').val('2004');
            $('#HomeownersGeneral input[type=text]:eq(4)').val('2004');
            $('#HomeownersGeneral input[type=text]:eq(5)').val('2005');
            $('#HomeownersGeneral input[type=text]:eq(6)').val('2004');
            $('#HomeownersGeneral select:eq(6) option:eq(1)').prop('selected', true);
            $('#HomeownersGeneral select:eq(7) option:eq(1)').prop('selected', true);
            $('#HomeownersGeneral select:eq(8) option:eq(1)').prop('selected', true);
            $('#HomeownersGeneral select:eq(9) option:eq(1)').prop('selected', true);
            $('#HomeownersGeneral select:eq(10) option:eq(2)').prop('selected', true);
            $('#HomeownersGeneral select:eq(11) option:eq(2)').prop('selected', true);
            $('select:eq(12) option:eq(4)').prop('selected', true);
            $('select:eq(13) option:eq(1)').prop('selected', true);
            $('select:eq(14) option:eq(3)').prop('selected', true);
            $('select:eq(15) option:eq(5)').prop('selected', true);

            $('#NextPage').click();
        });

        console.log("final page passed");
        await page.waitForNavigation();
        await page.waitFor(2000);

        await page.click('#Wizard_LossHistory');
        await page.waitFor(4000);

        var info = await page.evaluate(() => {
            var result = {};
            var buf = [];
            var a = {};
            var index = 0;
            var prefix = '#LossHistory_'+index;
            for(; $(prefix +'_LossHistoryNumber').length > 0; index++){
                a.losshistory_no = $(prefix+'_LossHistoryNumber').html();
                a.losshistory_date = $(prefix+'_LossDt').html();
                a.losshistory_amount = $(prefix+'_LossAmt').html();
                a.losshistory_cause = $(prefix+'_LossCauseCd').html();
                a.claim_no = $(prefix+'_ClaimNumber').html();
                a.claim_status = $(prefix+'_ClaimStatusCd').html();
                a.source_cd = $(prefix+'_SourceCd').html();
                prefix = '#LossHistory_'+(index+1);
                buf.push(a);
            }
            result.claims = buf;
            result.price = $('#QuoteAppSummary_PremWithTaxesFeesAmt').html();
            return result;
        });
        browser.close();
        return info;
    }
}