
// This file holds generic styles/fonts/etc to be used in any scene


//------------------------BOARD HEXES------------------------//
export const hexColors = {
    land: 0x7fffb2,
    landDeploy: 0x5bc485,
    landHover: 0xbbf2d0,

    water: 0x5494ff,
    waterDeploy: 0x3e72c8,
    waterHover: 0x8ab6ff,

    objective: 0xff3e3e,
    objectiveHover: 0xfa8c8c,

    mine: 0xffe154,
    mineHover: 0xffefa6,

    click: 0xffffff,
};

// Define a union type for the valid hex types
export type HexType = 'land' | 'water' | 'landDeploy' | 'waterDeploy' | 'objective' | 'mine';

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
    waterDeploy: {
        default: hexColors.waterDeploy,
        hover: hexColors.waterHover,
        click: hexColors.click,
    },
    objective: {
        default: hexColors.objective,
        hover: hexColors.objectiveHover,
        click: hexColors.click,
    },
    mine: {
        default: hexColors.mine,
        hover: hexColors.mineHover,
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

export const buttonOverStroke = {colour: '#0000ff', thickness: 2};
export const buttonOverStyle = { fontSize: '36px', color: '#0000ff'};

export const buttonOutStroke = {colour: '#ffffff', thickness: 2};
export const buttonOutStyle = { fontSize: '36px', color: '#ffffff'};

export const buttonDownStroke = {colour: '#ffffff', thickness: 2};
export const buttonDownStyle = { fontSize: '36px', color: '#ffffff' };

export const buttonUpStroke = {colour: '#0000ff', thickness: 2};
export const buttonUpStyle = { fontSize: '36px', color: '#0000ff'};

//-------------------------COLOURS---------------------------//
