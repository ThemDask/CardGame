
// This file holds generic styles/fonts/etc to be used in any scene


//------------------------BOARD HEXES------------------------//
export const hexColors = {
    land: 0x5bc485,
    landDeploy: 0x5bc485,
    water: 0x0000ff,
    yellowTP: 0xfff176,
    AzureTP: 0x5ca9e7,
    redTP: 0xc83c3c,
    whiteTP: 0xffffff,
    purpleTP: 0xb64bc8,
    orangeTP: 0xe99e2e,
    pinkTP: 0xed7ea4,

    landHover: 0xbbf2d0,
    yellowTPHover: 0xc2a500,
    AzureTPHover: 0x0060c8,
    redTPHover: 0xc80000,
    whiteTPHover: 0xffffff,
    purpleTPHover: 0x8000c8,
    orangeTPHover: 0xc88500,
    pinkTPHover: 0xc895b6,
    waterHover: 0x8ab6ff,

    click: 0xffffff,
};

// Define a union type for the valid hex types
export type HexType = 'land' | 'water' | 'landDeploy' | 'yellowTP' | 'AzureTP' | 'redTP' | 'whiteTP' | 'purpleTP' | 'orangeTP' | 'pinkTP';

export const hexTypes: Record<HexType, { default: number; hover: number; click: number }> = {
    land: {
        default: hexColors.land,
        hover: hexColors.landHover,
        click: hexColors.click,
    },
    water: {
        default: hexColors.water,
        hover: hexColors.waterHover,
        click: hexColors.click,
    },
    landDeploy: {
        default: hexColors.landDeploy,
        hover: hexColors.landHover,
        click: hexColors.click,
    },
    yellowTP: {
        default: hexColors.yellowTP,
        hover: hexColors.yellowTPHover,
        click: hexColors.click,
    },
    AzureTP: {
        default: hexColors.AzureTP,
        hover: hexColors.AzureTPHover,
        click: hexColors.click,
    },
    redTP: {
        default: hexColors.redTP,
        hover: hexColors.redTPHover,
        click: hexColors.click,
    },
    whiteTP: {
        default: hexColors.whiteTP,
        hover: hexColors.whiteTPHover,
        click: hexColors.click,
    },
    purpleTP: {
        default: hexColors.purpleTP,
        hover: hexColors.purpleTPHover,
        click: hexColors.click,
    },
    orangeTP: {
        default: hexColors.orangeTP,
        hover: hexColors.orangeTPHover,
        click: hexColors.click,
    },
    pinkTP: {
        default: hexColors.pinkTP,
        hover: hexColors.pinkTPHover,
        click: hexColors.click,
    }
};


//--------------------------FONTS----------------------------//
// gia arithmus: trajan pro
// gia text: cambia
// gia flavor ability text: Chaparel pro + light italic + italic filter+ crisp
// gia keywords: cambia + bold

export const textFont = {
    font: '28px Cambay',
    fontFamily: 'Cambay',
    fontSize: '32px',
    color: '#ffffff',
};

export const keywordFont = {
    font: '22px Cambay',
    fontFamily: 'Cambay',
    fontSize: '32px',
    fontStyle: 'bold',
    color: '#ffffff',
};

export const flavorFont =  {
    font: '20px Chaparral Pro',
    fontFamily: 'Chaparral Pro',
    fontSize: '32px',
    fontStyle: 'bold italic',
    color: '#ffffff',
};

export const numberFont = {
    font: '28px Trajan Pro',
    fontFamily: 'Trajan Pro',
    fontSize: '32px',
    color: '#ffffff',
    fontStyle: 'bold',
};

//-------------------------BUTTONS---------------------------//

export const buttonOverStroke = {colour: '#e51717', thickness: 2};
export const buttonOverStyle = { fontSize: '36px', color: '#e51717'};

export const buttonOutStroke = {colour: '#ffffff', thickness: 2};
export const buttonOutStyle = { fontSize: '36px', color: '#ffffff'};

export const buttonDownStroke = {colour: '#ffffff', thickness: 2};
export const buttonDownStyle = { fontSize: '36px', color: '#ffffff' };

export const buttonUpStroke = {colour: '#e51717', thickness: 2};
export const buttonUpStyle = { fontSize: '36px', color: '#e51717'};

//-------------------------COLOURS---------------------------//
