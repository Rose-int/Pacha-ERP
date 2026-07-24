/* ==========================================================================
   Pachamama ERP - Database Layer (Parsed from Real Masters)
   ========================================================================== */

const DB_VERSION = "1.8.0";
const STORAGE_PREFIX = "pachamama_erp_";

// Default Seed Data
const DEFAULT_SEEDS = {
    empresas: [
    {
        "id": "EXP001",
        "nombre": "PACHAMAMA",
        "estado": "Activo"
    },
    {
        "id": "EXP002",
        "nombre": "CAMPOSOL",
        "estado": "Activo"
    },
    {
        "id": "EXP003",
        "nombre": "AGROFRUTOS",
        "estado": "Activo"
    },
    {
        "id": "EXP004",
        "nombre": "FRUIT CO",
        "estado": "Activo"
    },
    {
        "id": "EXP005",
        "nombre": "LAS MERCEDES",
        "estado": "Activo"
    },
    {
        "id": "EXP006",
        "nombre": "WESFALIA",
        "estado": "Activo"
    }
],
    clientes: [
    {
        "id": "CLI001",
        "nombre": "530 L-SATORI",
        "estado": "Activo"
    },
    {
        "id": "CLI002",
        "nombre": "530 LOGISTICS",
        "estado": "Activo"
    },
    {
        "id": "CLI003",
        "nombre": "ABC L-EDEKA",
        "estado": "Activo"
    },
    {
        "id": "CLI004",
        "nombre": "ABC LOGISITCS",
        "estado": "Activo"
    },
    {
        "id": "CLI005",
        "nombre": "ANIMA SO EXOTICS",
        "estado": "Activo"
    },
    {
        "id": "CLI006",
        "nombre": "CANADA",
        "estado": "Activo"
    },
    {
        "id": "CLI007",
        "nombre": "CULTIVAR",
        "estado": "Activo"
    },
    {
        "id": "CLI008",
        "nombre": "DOLE ITALIA",
        "estado": "Activo"
    },
    {
        "id": "CLI009",
        "nombre": "DPS (M&S) LTD",
        "estado": "Activo"
    },
    {
        "id": "CLI010",
        "nombre": "DPS TESCO",
        "estado": "Activo"
    },
    {
        "id": "CLI011",
        "nombre": "EDEKA",
        "estado": "Activo"
    },
    {
        "id": "CLI012",
        "nombre": "FRUTURA",
        "estado": "Activo"
    },
    {
        "id": "CLI013",
        "nombre": "GRAND INTERNATIONAL",
        "estado": "Activo"
    },
    {
        "id": "CLI014",
        "nombre": "INGMAR",
        "estado": "Activo"
    },
    {
        "id": "CLI015",
        "nombre": "KIBSTON",
        "estado": "Activo"
    },
    {
        "id": "CLI016",
        "nombre": "MISSION PRODUCE",
        "estado": "Activo"
    },
    {
        "id": "CLI017",
        "nombre": "NEXTBRIX",
        "estado": "Activo"
    },
    {
        "id": "CLI018",
        "nombre": "OGL",
        "estado": "Activo"
    },
    {
        "id": "CLI019",
        "nombre": "PINTO BROTHERS INC",
        "estado": "Activo"
    },
    {
        "id": "CLI020",
        "nombre": "PRIMAFRUIT LTD",
        "estado": "Activo"
    },
    {
        "id": "CLI021",
        "nombre": "SATORI S.A.",
        "estado": "Activo"
    },
    {
        "id": "CLI022",
        "nombre": "SL PRODUCE",
        "estado": "Activo"
    },
    {
        "id": "CLI023",
        "nombre": "SOO IL COMMERCE",
        "estado": "Activo"
    },
    {
        "id": "CLI024",
        "nombre": "SPINNEYS",
        "estado": "Activo"
    },
    {
        "id": "CLI025",
        "nombre": "STARFRUIT",
        "estado": "Activo"
    },
    {
        "id": "CLI026",
        "nombre": "SUNJAI",
        "estado": "Activo"
    },
    {
        "id": "CLI027",
        "nombre": "SUPAFRESH",
        "estado": "Activo"
    },
    {
        "id": "CLI028",
        "nombre": "SUPREME FRUITS LDA",
        "estado": "Activo"
    },
    {
        "id": "CLI029",
        "nombre": "WALMART CHILE",
        "estado": "Activo"
    },
    {
        "id": "CLI030",
        "nombre": "WALMART LARGE",
        "estado": "Activo"
    },
    {
        "id": "CLI031",
        "nombre": "WALMART SMALL",
        "estado": "Activo"
    },
    {
        "id": "CLI032",
        "nombre": "WALMART X-LARGE",
        "estado": "Activo"
    },
    {
        "id": "CLI033",
        "nombre": "WESTFALIA",
        "estado": "Activo"
    }
],
    proveedores_mp: [
    {
        "id": "PROV001",
        "nombre": "JAIME ALFREDO SUCLLA FLORES",
        "fundo": "LA BUENA TIERRA",
        "valle": "SAN LORENZO",
        "clp": "015-0291-0000",
        "estado": "Activo"
    },
    {
        "id": "PROV002",
        "nombre": "PACHAMAMA 01 - LAS BRISAS",
        "fundo": "LAS BRISAS",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0001",
        "estado": "Activo"
    },
    {
        "id": "PROV003",
        "nombre": "PACHAMAMA 02 - TOP FRUIT",
        "fundo": "TOP FRUIT",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0002",
        "estado": "Activo"
    },
    {
        "id": "PROV004",
        "nombre": "LIMAGRO SA",
        "fundo": "EL REFUGIO",
        "valle": "CIENEGUILLO",
        "clp": "015-0291-0003",
        "estado": "Activo"
    },
    {
        "id": "PROV005",
        "nombre": "TAURO S.R.L",
        "fundo": "TAURO",
        "valle": "CIENEGUILLO",
        "clp": "015-0291-0004",
        "estado": "Activo"
    },
    {
        "id": "PROV011",
        "nombre": "CARMEN JUAREZ TEODULO",
        "fundo": "JUAREZ",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0005",
        "estado": "Activo"
    },
    {
        "id": "PROV014",
        "nombre": "OCHOA VICENTE PEDRO",
        "fundo": "SANTA ROSA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0006",
        "estado": "Activo"
    },
    {
        "id": "PROV023",
        "nombre": "CARREÑO MIRANDA JAVIER",
        "fundo": "MIRANDA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0007",
        "estado": "Activo"
    },
    {
        "id": "PROV024",
        "nombre": "SANTOS ZAPATA JUSTO EMILIO",
        "fundo": "ZAPATA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0008",
        "estado": "Activo"
    },
    {
        "id": "PROV025",
        "nombre": "LINARES ÑAÑEZ VICTOR EDUARDO",
        "fundo": "LINARES",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0009",
        "estado": "Activo"
    },
    {
        "id": "PROV025",
        "nombre": "LINARES ÑAÑEZ VICTOR EDUARDO",
        "fundo": "LINARES",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0010",
        "estado": "Activo"
    },
    {
        "id": "PROV027",
        "nombre": "CRISANTO MENDOZA CLAUDIO",
        "fundo": "MARIELA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0011",
        "estado": "Activo"
    },
    {
        "id": "PROV039",
        "nombre": "SEMINARIO ZETA JOSE RODOLFO",
        "fundo": "AGRICOLA SEMINARIO",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0012",
        "estado": "Activo"
    },
    {
        "id": "PROV044",
        "nombre": "RAMOS DE PRIETO YRENE",
        "fundo": "RAMOS",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0013",
        "estado": "Activo"
    },
    {
        "id": "PROV047",
        "nombre": "CARLOS SAAVEDRA PATIÑO",
        "fundo": "PATIÑO",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0014",
        "estado": "Activo"
    },
    {
        "id": "PROV050",
        "nombre": "VILLARAN REY JULIAN LIANDRO",
        "fundo": "REY",
        "valle": "CASMA",
        "clp": "015-0291-0015",
        "estado": "Activo"
    },
    {
        "id": "PROV051",
        "nombre": "PAREDES DE LA CRUZ NILA NORITA",
        "fundo": "PAREDES",
        "valle": "CASMA",
        "clp": "015-0291-0016",
        "estado": "Activo"
    },
    {
        "id": "PROV055",
        "nombre": "INFANTES CANCHA NARCISO",
        "fundo": "INFANTES",
        "valle": "CASMA",
        "clp": "015-0291-0017",
        "estado": "Activo"
    },
    {
        "id": "PROV056",
        "nombre": "REYES CORONACION EMILIO ALEJANDRO",
        "fundo": "REYES",
        "valle": "CASMA",
        "clp": "015-0291-0018",
        "estado": "Activo"
    },
    {
        "id": "PROV056",
        "nombre": "REYES CORONACION EMILIO ALEJANDRO",
        "fundo": "REYES",
        "valle": "CASMA",
        "clp": "015-0291-0019",
        "estado": "Activo"
    },
    {
        "id": "PROV056",
        "nombre": "REYES CORONACION EMILIO ALEJANDRO",
        "fundo": "REYES",
        "valle": "CASMA",
        "clp": "015-0291-0020",
        "estado": "Activo"
    },
    {
        "id": "PROV058",
        "nombre": "REYES SANTOS JULIO MODESTO",
        "fundo": "JULIO",
        "valle": "CASMA",
        "clp": "015-0291-0021",
        "estado": "Activo"
    },
    {
        "id": "PROV061",
        "nombre": "CONDOR PAJUELO MIGUEL",
        "fundo": "PAJUELO",
        "valle": "CASMA",
        "clp": "015-0291-0022",
        "estado": "Activo"
    },
    {
        "id": "PROV066",
        "nombre": "CABELLO ROJAS SYLVIA JULIA",
        "fundo": "EL CARMEN",
        "valle": "CASMA",
        "clp": "015-0291-0023",
        "estado": "Activo"
    },
    {
        "id": "PROV070",
        "nombre": "GONZALES BERNUY WALTER ORLANDO",
        "fundo": "ROMA",
        "valle": "CASMA",
        "clp": "015-0291-0024",
        "estado": "Activo"
    },
    {
        "id": "PROV074",
        "nombre": "ÑOPE PUNTILLA VICTOR ANTONIO",
        "fundo": "ÑOPE",
        "valle": "CASMA",
        "clp": "015-0291-0025",
        "estado": "Activo"
    },
    {
        "id": "PROV078",
        "nombre": "LARA HUAMAN LUZMILA",
        "fundo": "LUZMILA",
        "valle": "CASMA",
        "clp": "015-0291-0026",
        "estado": "Activo"
    },
    {
        "id": "PROV083",
        "nombre": "JARA PAJUELO MAXIMO CARLOS",
        "fundo": "CARLOS",
        "valle": "CASMA",
        "clp": "015-0291-0027",
        "estado": "Activo"
    },
    {
        "id": "PROV084",
        "nombre": "BENITES DE BENITES MARIA DOLORES",
        "fundo": "MARIA D",
        "valle": "CASMA",
        "clp": "015-0291-0028",
        "estado": "Activo"
    },
    {
        "id": "PROV085",
        "nombre": "LAMAS VALDEZ ANA PAOLA",
        "fundo": "LAMAS",
        "valle": "CASMA",
        "clp": "015-0291-0029",
        "estado": "Activo"
    },
    {
        "id": "PROV086",
        "nombre": "CONSOLACION MENDEZ WESLEY ENOC",
        "fundo": "ENOC",
        "valle": "CASMA",
        "clp": "015-0291-0030",
        "estado": "Activo"
    },
    {
        "id": "PROV093",
        "nombre": "HUANRI SEVILLANO REYNEE RUBEN",
        "fundo": "SAN FIDEL",
        "valle": "CASMA",
        "clp": "015-0291-0031",
        "estado": "Activo"
    },
    {
        "id": "PROV095",
        "nombre": "CONSOLACION CASIO TIMOTEO TEOD",
        "fundo": "CONSOLACION",
        "valle": "CASMA",
        "clp": "015-0291-0032",
        "estado": "Activo"
    },
    {
        "id": "PROV102",
        "nombre": "JARA PAJUELO EUGENIA MERCEDES",
        "fundo": "JARA",
        "valle": "CASMA",
        "clp": "015-0291-0033",
        "estado": "Activo"
    },
    {
        "id": "PROV103",
        "nombre": "FLORES LOPEZ LUIS",
        "fundo": "FLORES",
        "valle": "CASMA",
        "clp": "015-0291-0034",
        "estado": "Activo"
    },
    {
        "id": "PROV111",
        "nombre": "MARCELO DOLORES MARCIAL JAIME",
        "fundo": "JAIME",
        "valle": "CASMA",
        "clp": "015-0291-0035",
        "estado": "Activo"
    },
    {
        "id": "PROV133",
        "nombre": "VEGA VEGA ELOY IGNACIO",
        "fundo": "PIERINA",
        "valle": "LAS LOMAS",
        "clp": "015-0291-0036",
        "estado": "Activo"
    },
    {
        "id": "PROV143",
        "nombre": "YOVERA SULLON SANTOS",
        "fundo": "SANTOS",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0037",
        "estado": "Activo"
    },
    {
        "id": "PROV144",
        "nombre": "CHERRES ALAMA CARLOS ENRIQUE",
        "fundo": "ALAMA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0038",
        "estado": "Activo"
    },
    {
        "id": "PROV145",
        "nombre": "PRIETO VDA DE GARCIA MARTHA YOVANI",
        "fundo": "PRIETO",
        "valle": "LAS LOMAS",
        "clp": "015-0291-0039",
        "estado": "Activo"
    },
    {
        "id": "PROV146",
        "nombre": "URRIOLA GAONA HEREDEROS",
        "fundo": "URRIOLA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0040",
        "estado": "Activo"
    },
    {
        "id": "PROV147",
        "nombre": "RUGEL PANAMO MARIA CELIA",
        "fundo": "NORMA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0041",
        "estado": "Activo"
    },
    {
        "id": "PROV148",
        "nombre": "TORRES NIZAMA PASCUAL",
        "fundo": "MI TATHIANA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0042",
        "estado": "Activo"
    },
    {
        "id": "PROV149",
        "nombre": "RAMOS NAQUICHE JOSE SANTOS",
        "fundo": "JOSE",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0043",
        "estado": "Activo"
    },
    {
        "id": "PROV150",
        "nombre": "TECNOLOGY FLEX S.A.C",
        "fundo": "FLEXER",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0044",
        "estado": "Activo"
    },
    {
        "id": "PROV151",
        "nombre": "CARRILLO PALOMINO PEDRO FRANCISCO",
        "fundo": "CARRILLO",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0045",
        "estado": "Activo"
    },
    {
        "id": "PROV152",
        "nombre": "VALDIVIEZO CHAPA TEODORO ABELARDO",
        "fundo": "V.A.",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0046",
        "estado": "Activo"
    },
    {
        "id": "PROV152",
        "nombre": "VALDIVIEZO CHAPA TEODORO ABELARDO",
        "fundo": "V.A.",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0047",
        "estado": "Activo"
    },
    {
        "id": "PROV153",
        "nombre": "CARMEN SAAVEDRA FAUSTINO",
        "fundo": "SAAVEDRA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0048",
        "estado": "Activo"
    },
    {
        "id": "PROV154",
        "nombre": "RUFINO OJEDA GIANCARLO",
        "fundo": "OJEDA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0049",
        "estado": "Activo"
    },
    {
        "id": "PROV155",
        "nombre": "YOVERA YOVERA ASENCION",
        "fundo": "JUAN VELASCO",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0050",
        "estado": "Activo"
    },
    {
        "id": "PROV156",
        "nombre": "NIMA ALAMA SEGUNDO",
        "fundo": "ALAMA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0051",
        "estado": "Activo"
    },
    {
        "id": "PROV157",
        "nombre": "CHANTA FLORES ANDRES",
        "fundo": "CHANTA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0052",
        "estado": "Activo"
    },
    {
        "id": "PROV158",
        "nombre": "SEMINARIO PULACHE MANUEL",
        "fundo": "MANUEL",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0053",
        "estado": "Activo"
    },
    {
        "id": "PROV159",
        "nombre": "SANDOVAL VALDIVIEZO ROBERTO LIZANDRO",
        "fundo": "SANDOVAL",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0054",
        "estado": "Activo"
    },
    {
        "id": "PROV160",
        "nombre": "NEYRA LEON YANY VICTORIA",
        "fundo": "ROSITA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0055",
        "estado": "Activo"
    },
    {
        "id": "PROV161",
        "nombre": "HERRERA DE RIVAS AMERICA",
        "fundo": "RIVAZ",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0056",
        "estado": "Activo"
    },
    {
        "id": "PROV162",
        "nombre": "GIRON MENDOZA JOSE RAUL",
        "fundo": "GIRON",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0057",
        "estado": "Activo"
    },
    {
        "id": "PROV163",
        "nombre": "SEMINARIO JUAREZ FERNANDO",
        "fundo": "JUAREZ",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0058",
        "estado": "Activo"
    },
    {
        "id": "PROV164",
        "nombre": "TORRES HUINCHO VDA DE GONZALES MAGNA MAXIMA",
        "fundo": "TORRES",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0059",
        "estado": "Activo"
    },
    {
        "id": "PROV165",
        "nombre": "CASTRO ORDINOLA EDMUNDO",
        "fundo": "CASTRO",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0060",
        "estado": "Activo"
    },
    {
        "id": "PROV165",
        "nombre": "CASTRO ORDINOLA EDMUNDO",
        "fundo": "CASTRO",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0061",
        "estado": "Activo"
    },
    {
        "id": "PROV166",
        "nombre": "QUINTANA RAMIREZ RAFAEL",
        "fundo": "QUINTANA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0062",
        "estado": "Activo"
    },
    {
        "id": "PROV167",
        "nombre": "IPANAQUE DE CARMEN JULIA",
        "fundo": "CARMEN",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0063",
        "estado": "Activo"
    },
    {
        "id": "PROV168",
        "nombre": "NIMA DE JUAREZ YDA JOSEFINA",
        "fundo": "NIMA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0064",
        "estado": "Activo"
    },
    {
        "id": "PROV169",
        "nombre": "AGUILAR JUAREZ JULIO",
        "fundo": "AGUILAR",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0065",
        "estado": "Activo"
    },
    {
        "id": "PROV169",
        "nombre": "AGUILAR JUAREZ JULIO",
        "fundo": "AGUILAR",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0066",
        "estado": "Activo"
    },
    {
        "id": "PROV170",
        "nombre": "VEGA CRISANTO ELSA",
        "fundo": "VEGA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0067",
        "estado": "Activo"
    },
    {
        "id": "PROV171",
        "nombre": "CORDOVA PULACHE SEGUNDO",
        "fundo": "ALEJANDRA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0068",
        "estado": "Activo"
    },
    {
        "id": "PROV172",
        "nombre": "ORTIZ FLORES DORA ANDREA",
        "fundo": "FLORES",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0069",
        "estado": "Activo"
    },
    {
        "id": "PROV173",
        "nombre": "QUISPE RIOFRIO VDA DE RIVAS BEATRIZ",
        "fundo": "RIVAZ",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0070",
        "estado": "Activo"
    },
    {
        "id": "PROV174",
        "nombre": "IPANAQUE SILVA SEBASTIAN",
        "fundo": "SILVA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0071",
        "estado": "Activo"
    },
    {
        "id": "PROV175",
        "nombre": "MENA PULACHE SANTOS ANTONIO",
        "fundo": "MENA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0072",
        "estado": "Activo"
    },
    {
        "id": "PROV176",
        "nombre": "ENCALADA JIMBO JOSE",
        "fundo": "JIMBO",
        "valle": "SULLANA",
        "clp": "015-0291-0073",
        "estado": "Activo"
    },
    {
        "id": "PROV176",
        "nombre": "ENCALADA JIMBO JOSE",
        "fundo": "JIMBO",
        "valle": "SULLANA",
        "clp": "015-0291-0074",
        "estado": "Activo"
    },
    {
        "id": "PROV176",
        "nombre": "ENCALADA JIMBO JOSE",
        "fundo": "JIMBO",
        "valle": "SULLANA",
        "clp": "015-0291-0075",
        "estado": "Activo"
    },
    {
        "id": "PROV177",
        "nombre": "VALENCIA SERNAQUE SANTIAGO",
        "fundo": "VALENCIA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0076",
        "estado": "Activo"
    },
    {
        "id": "PROV178",
        "nombre": "SEMINARIO ROSAS CARMEN",
        "fundo": "SEMINARIO",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0077",
        "estado": "Activo"
    },
    {
        "id": "PROV179",
        "nombre": "SILVA IMAN ABRAHAN",
        "fundo": "SILVA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0078",
        "estado": "Activo"
    },
    {
        "id": "PROV180",
        "nombre": "RAMIREZ NIEVES FELIPE",
        "fundo": "FELIPE",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0079",
        "estado": "Activo"
    },
    {
        "id": "PROV180",
        "nombre": "RAMIREZ NIEVES FELIPE",
        "fundo": "FELIPE",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0080",
        "estado": "Activo"
    },
    {
        "id": "PROV181",
        "nombre": "SILVA DE PAZO MARIA EVANGELINA",
        "fundo": "SILVA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0081",
        "estado": "Activo"
    },
    {
        "id": "PROV182",
        "nombre": "VILLEGAS CHAVEZ VDA DE SEMINARIO MARIA ELISA",
        "fundo": "MARIA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0082",
        "estado": "Activo"
    },
    {
        "id": "PROV183",
        "nombre": "MENDOZA AREVALO ESTUARDO",
        "fundo": "AREVALO",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0083",
        "estado": "Activo"
    },
    {
        "id": "PROV184",
        "nombre": "AREVALO RIOFRIO FEDERICO",
        "fundo": "AREVALO",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0084",
        "estado": "Activo"
    },
    {
        "id": "PROV184",
        "nombre": "AREVALO RIOFRIO FEDERICO",
        "fundo": "AREVALO",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0085",
        "estado": "Activo"
    },
    {
        "id": "PROV185",
        "nombre": "ALVA SANTILLAN JUAN ANTONIO",
        "fundo": "SANTA CATALINA",
        "valle": "CASMA",
        "clp": "015-0291-0086",
        "estado": "Activo"
    },
    {
        "id": "PROV185",
        "nombre": "ALVA SANTILLAN JUAN ANTONIO",
        "fundo": "SANTA CATALINA",
        "valle": "CASMA",
        "clp": "015-0291-0087",
        "estado": "Activo"
    },
    {
        "id": "PROV186",
        "nombre": "VILCHEZ QUINTANA JOSE DEL CARMEN",
        "fundo": "QUINTANA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0088",
        "estado": "Activo"
    },
    {
        "id": "PROV187",
        "nombre": "IPANAQUE MACALUPU JOSE JULIO",
        "fundo": "JOSE",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0089",
        "estado": "Activo"
    },
    {
        "id": "PROV188",
        "nombre": "CARMEN PANTA CESAR",
        "fundo": "EL EDEN",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0090",
        "estado": "Activo"
    },
    {
        "id": "PROV189",
        "nombre": "AGRICOLA LAS DUNAS S R LTDA",
        "fundo": "LAS DUNAS",
        "valle": "CIENEGUILLO",
        "clp": "015-0291-0091",
        "estado": "Activo"
    },
    {
        "id": "PROV190",
        "nombre": "ANGELES CUTAMANCA GIOVANI GRABILIO",
        "fundo": "ANGELES",
        "valle": "CASMA",
        "clp": "015-0291-0092",
        "estado": "Activo"
    },
    {
        "id": "PROV191",
        "nombre": "ROMERO YERBASANTA TEOFILO",
        "fundo": "YERBASANTA",
        "valle": "CASMA",
        "clp": "015-0291-0093",
        "estado": "Activo"
    },
    {
        "id": "PROV192",
        "nombre": "ROMERO CASIO DAVID ROLANDO",
        "fundo": "ROMERO",
        "valle": "CASMA",
        "clp": "015-0291-0094",
        "estado": "Activo"
    },
    {
        "id": "PROV193",
        "nombre": "MENDOZA ROQUE RODOLFO JULIAN",
        "fundo": "ROQUE",
        "valle": "CASMA",
        "clp": "015-0291-0095",
        "estado": "Activo"
    },
    {
        "id": "PROV194",
        "nombre": "ABAL JARA PILAR GUADALUPE",
        "fundo": "JARA",
        "valle": "CASMA",
        "clp": "015-0291-0096",
        "estado": "Activo"
    },
    {
        "id": "PROV195",
        "nombre": "YUPANQUI AVILA LUCILA",
        "fundo": "YUPANQUI",
        "valle": "CASMA",
        "clp": "015-0291-0097",
        "estado": "Activo"
    },
    {
        "id": "PROV196",
        "nombre": "MINAYA DELAO PAOLA ZARELY",
        "fundo": "PAOLA",
        "valle": "CASMA",
        "clp": "015-0291-0098",
        "estado": "Activo"
    },
    {
        "id": "PROV197",
        "nombre": "FLORES SHICSHI ERICKA JUDITH",
        "fundo": "JUDITH",
        "valle": "CASMA",
        "clp": "015-0291-0099",
        "estado": "Activo"
    },
    {
        "id": "PROV198",
        "nombre": "CANCHA INFANTES CAYETANO MARINO",
        "fundo": "CAYETANO",
        "valle": "CASMA",
        "clp": "015-0291-0100",
        "estado": "Activo"
    },
    {
        "id": "PROV199",
        "nombre": "OSORIO BALLICO PEDRO DEDICACIÓN",
        "fundo": "BALLICO",
        "valle": "CASMA",
        "clp": "015-0291-0101",
        "estado": "Activo"
    },
    {
        "id": "PROV200",
        "nombre": "JARA GIRALDO LORENZO",
        "fundo": "JARA G",
        "valle": "CASMA",
        "clp": "015-0291-0102",
        "estado": "Activo"
    },
    {
        "id": "PROV201",
        "nombre": "ROMERO GUERRERO MAXIMO VALENTIN",
        "fundo": "MAXIMO",
        "valle": "CASMA",
        "clp": "015-0291-0103",
        "estado": "Activo"
    },
    {
        "id": "PROV202",
        "nombre": "HUALANCHO JACINTO FRANCISCO",
        "fundo": "HUALANCHO",
        "valle": "CASMA",
        "clp": "015-0291-0104",
        "estado": "Activo"
    },
    {
        "id": "PROV203",
        "nombre": "JULCA JACINTO JULIO",
        "fundo": "JULCA",
        "valle": "CASMA",
        "clp": "015-0291-0105",
        "estado": "Activo"
    },
    {
        "id": "PROV204",
        "nombre": "CHUYUS CADILLO DIOGENES MARCELINO",
        "fundo": "CHUYUS",
        "valle": "CASMA",
        "clp": "015-0291-0106",
        "estado": "Activo"
    },
    {
        "id": "PROV205",
        "nombre": "GRANADOS MAZA AGAPITO",
        "fundo": "MAZA",
        "valle": "CASMA",
        "clp": "015-0291-0107",
        "estado": "Activo"
    },
    {
        "id": "PROV206",
        "nombre": "WONG BERROSPI CAROL",
        "fundo": "WONG",
        "valle": "CASMA",
        "clp": "015-0291-0108",
        "estado": "Activo"
    },
    {
        "id": "PROV207",
        "nombre": "KACHA INFANTES ERLY SANDRO",
        "fundo": "ERLY",
        "valle": "CASMA",
        "clp": "015-0291-0109",
        "estado": "Activo"
    },
    {
        "id": "PROV208",
        "nombre": "LUMBE TARAZONA HUGO DIONISIO",
        "fundo": "LUMBE",
        "valle": "CASMA",
        "clp": "015-0291-0110",
        "estado": "Activo"
    },
    {
        "id": "PROV209",
        "nombre": "MILLA CUTAMANCA PABLO",
        "fundo": "MILLA",
        "valle": "CASMA",
        "clp": "015-0291-0111",
        "estado": "Activo"
    },
    {
        "id": "PROV210",
        "nombre": "MILLA MARTINEZ JORGE ALBERTO",
        "fundo": "ALBERTO",
        "valle": "CASMA",
        "clp": "015-0291-0112",
        "estado": "Activo"
    },
    {
        "id": "PROV211",
        "nombre": "PALACIOS SOLIS RUFINA SERAFINA",
        "fundo": "SOLIS",
        "valle": "CASMA",
        "clp": "015-0291-0113",
        "estado": "Activo"
    },
    {
        "id": "PROV212",
        "nombre": "HUALANCHO COTRINO OSCAR SANTIAGO",
        "fundo": "OSCAR",
        "valle": "CASMA",
        "clp": "015-0291-0114",
        "estado": "Activo"
    },
    {
        "id": "PROV213",
        "nombre": "CONGO CUTAMANCA FERNANDO PASCUAL",
        "fundo": "CUTAMANCA",
        "valle": "CASMA",
        "clp": "015-0291-0115",
        "estado": "Activo"
    },
    {
        "id": "PROV214",
        "nombre": "CONGO TAHUA JUAN CARLOS",
        "fundo": "JUAN",
        "valle": "CASMA",
        "clp": "015-0291-0116",
        "estado": "Activo"
    },
    {
        "id": "PROV215",
        "nombre": "CORCINO MONTALVAN DOLORES",
        "fundo": "MONTALVAN",
        "valle": "CASMA",
        "clp": "015-0291-0117",
        "estado": "Activo"
    },
    {
        "id": "PROV216",
        "nombre": "RAMIREZ MORENO CATALINO",
        "fundo": "RAMIREZ",
        "valle": "CASMA",
        "clp": "015-0291-0118",
        "estado": "Activo"
    },
    {
        "id": "PROV217",
        "nombre": "JARA LLANTO VIOLETA VERONICA",
        "fundo": "VIOLETA",
        "valle": "CASMA",
        "clp": "015-0291-0119",
        "estado": "Activo"
    },
    {
        "id": "PROV218",
        "nombre": "LOMPARTE ALVAREZ MARTIN RODOLFO ENRIQUE",
        "fundo": "LA MAQUINA",
        "valle": "CASMA",
        "clp": "015-0291-0120",
        "estado": "Activo"
    },
    {
        "id": "PROV219",
        "nombre": "FLORES SHICSHI ERICK JONATHAN",
        "fundo": "ERICK",
        "valle": "CASMA",
        "clp": "015-0291-0121",
        "estado": "Activo"
    },
    {
        "id": "PROV220",
        "nombre": "INVERSIONES TURISTICAS LA CASONA SAC",
        "fundo": "CUNCAN",
        "valle": "CASMA",
        "clp": "015-0291-0122",
        "estado": "Activo"
    },
    {
        "id": "PROV221",
        "nombre": "LOPEZ CARBAJAL FLORENCIA MARILLYN",
        "fundo": "LOPEZ",
        "valle": "CASMA",
        "clp": "015-0291-0123",
        "estado": "Activo"
    },
    {
        "id": "PROV222",
        "nombre": "MARIN FIGUEROA MARIA EUGENIA",
        "fundo": "MARIN",
        "valle": "CASMA",
        "clp": "015-0291-0124",
        "estado": "Activo"
    },
    {
        "id": "PROV223",
        "nombre": "ROJAS LAZARO MARGARITA LUZ",
        "fundo": "LUZ",
        "valle": "CASMA",
        "clp": "015-0291-0125",
        "estado": "Activo"
    },
    {
        "id": "PROV224",
        "nombre": "SUAREZ BARROSO WILMER JUAN",
        "fundo": "LA MESITA",
        "valle": "CASMA",
        "clp": "015-0291-0126",
        "estado": "Activo"
    },
    {
        "id": "PROV225",
        "nombre": "PAREDES HUALANCHO VICTOR ANTONIO",
        "fundo": "ANTONIO",
        "valle": "CASMA",
        "clp": "015-0291-0127",
        "estado": "Activo"
    },
    {
        "id": "PROV226",
        "nombre": "TAHUA MACEDO SABINA MARCELA",
        "fundo": "SABINA",
        "valle": "CASMA",
        "clp": "015-0291-0128",
        "estado": "Activo"
    },
    {
        "id": "PROV227",
        "nombre": "SUAREZ FIGUEROA SIXTO",
        "fundo": "SIXTO",
        "valle": "CASMA",
        "clp": "015-0291-0129",
        "estado": "Activo"
    },
    {
        "id": "PROV228",
        "nombre": "COTRINO CARHUAYANO MAURICIO VICTOR",
        "fundo": "VICTOR",
        "valle": "CASMA",
        "clp": "015-0291-0130",
        "estado": "Activo"
    },
    {
        "id": "PROV229",
        "nombre": "COTRINO CARHUAYANO PABLO MARCIAL",
        "fundo": "MARCIAL",
        "valle": "CASMA",
        "clp": "015-0291-0131",
        "estado": "Activo"
    },
    {
        "id": "PROV230",
        "nombre": "CONGO HUERTA CESAR AUGUSTO",
        "fundo": "CESAR",
        "valle": "CASMA",
        "clp": "015-0291-0132",
        "estado": "Activo"
    },
    {
        "id": "PROV231",
        "nombre": "SUAREZ PONTE JULIO CESAR",
        "fundo": "PONTE",
        "valle": "CASMA",
        "clp": "015-0291-0133",
        "estado": "Activo"
    },
    {
        "id": "PROV232",
        "nombre": "COTRINO CARHUAYANO JUAN ZOILO",
        "fundo": "ZOILO",
        "valle": "CASMA",
        "clp": "015-0291-0134",
        "estado": "Activo"
    },
    {
        "id": "PROV233",
        "nombre": "JARA COTRINO LUIS ALFREDO",
        "fundo": "LUIS",
        "valle": "CASMA",
        "clp": "015-0291-0135",
        "estado": "Activo"
    },
    {
        "id": "PROV234",
        "nombre": "MEZA GADEA EVER GREGORIO",
        "fundo": "EVER",
        "valle": "CASMA",
        "clp": "015-0291-0136",
        "estado": "Activo"
    },
    {
        "id": "PROV235",
        "nombre": "MEZA ROJAS VICTOR",
        "fundo": "V. MEZA",
        "valle": "CASMA",
        "clp": "015-0291-0137",
        "estado": "Activo"
    },
    {
        "id": "PROV236",
        "nombre": "MEZA BURGOS ISABEL VERONICA",
        "fundo": "ISABEL",
        "valle": "CASMA",
        "clp": "015-0291-0138",
        "estado": "Activo"
    },
    {
        "id": "PROV237",
        "nombre": "VALVERDE TRUJILLO ALEJANDRO",
        "fundo": "ALEJANDRO",
        "valle": "CASMA",
        "clp": "015-0291-0139",
        "estado": "Activo"
    },
    {
        "id": "PROV238",
        "nombre": "MEZA ROJAS RAUL ALFONSO",
        "fundo": "ESMERALDA",
        "valle": "CASMA",
        "clp": "015-0291-0140",
        "estado": "Activo"
    },
    {
        "id": "PROV239",
        "nombre": "PAREDES ROMERO DARIO",
        "fundo": "DARIO",
        "valle": "CASMA",
        "clp": "015-0291-0141",
        "estado": "Activo"
    },
    {
        "id": "PROV240",
        "nombre": "LUNA FAJARDO HELLEN SULEIKA",
        "fundo": "ROSARIO",
        "valle": "CASMA",
        "clp": "015-0291-0142",
        "estado": "Activo"
    },
    {
        "id": "PROV241",
        "nombre": "VARGAS MARTINEZ AMANCIO GUILLERMO",
        "fundo": "VARGAS",
        "valle": "CASMA",
        "clp": "015-0291-0143",
        "estado": "Activo"
    },
    {
        "id": "PROV242",
        "nombre": "CHINCHAY GUERRERO MARIO MARTIN",
        "fundo": "A&CH",
        "valle": "CASMA",
        "clp": "015-0291-0144",
        "estado": "Activo"
    },
    {
        "id": "PROV243",
        "nombre": "SALINAS SALAZAR DALMIRA SANDRA",
        "fundo": "SALINAS",
        "valle": "CASMA",
        "clp": "015-0291-0145",
        "estado": "Activo"
    },
    {
        "id": "PROV244",
        "nombre": "CHINCHA LEIVA FELIX AVILIO",
        "fundo": "CHINCHA",
        "valle": "SANTA",
        "clp": "015-0291-0146",
        "estado": "Activo"
    },
    {
        "id": "PROV245",
        "nombre": "SALINAS SALAZAR PABLO SANTOS",
        "fundo": "PABLO",
        "valle": "CASMA",
        "clp": "015-0291-0147",
        "estado": "Activo"
    },
    {
        "id": "PROV246",
        "nombre": "ORTIZ VIDAL JHON EDWARD",
        "fundo": "VIDAL",
        "valle": "SANTA",
        "clp": "015-0291-0148",
        "estado": "Activo"
    },
    {
        "id": "PROV247",
        "nombre": "URDAY ARAUCANO EDWIN JHON",
        "fundo": "SAN JUAN",
        "valle": "SANTA",
        "clp": "015-0291-0149",
        "estado": "Activo"
    },
    {
        "id": "PROV248",
        "nombre": "MERCADO AGREDA ADRIANA",
        "fundo": "YADIRA",
        "valle": "SANTA",
        "clp": "015-0291-0150",
        "estado": "Activo"
    },
    {
        "id": "PROV249",
        "nombre": "CULQUI CHUPILLON ELIAS",
        "fundo": "SANTA",
        "valle": "SANTA",
        "clp": "015-0291-0151",
        "estado": "Activo"
    },
    {
        "id": "PROV250",
        "nombre": "MASHCO MANTILLA FELIX JESUS",
        "fundo": "VIVIANA",
        "valle": "SANTA",
        "clp": "015-0291-0152",
        "estado": "Activo"
    },
    {
        "id": "PROV251",
        "nombre": "SALINAS CORREA ROSARIO DEL PILAR",
        "fundo": "PILAR",
        "valle": "SANTA",
        "clp": "015-0291-0153",
        "estado": "Activo"
    },
    {
        "id": "PROV252",
        "nombre": "GUILLEN AGUAYO ALEJANDRO SENOVIO",
        "fundo": "GUILLEN",
        "valle": "SANTA",
        "clp": "015-0291-0154",
        "estado": "Activo"
    },
    {
        "id": "PROV253",
        "nombre": "LEON CAMPOS MAGDALENA",
        "fundo": "LEON",
        "valle": "SANTA",
        "clp": "015-0291-0155",
        "estado": "Activo"
    },
    {
        "id": "PROV254",
        "nombre": "GIRALDO MENDIETA FREDY FRANCISCO",
        "fundo": "CASMEÑO",
        "valle": "SANTA",
        "clp": "015-0291-0156",
        "estado": "Activo"
    },
    {
        "id": "PROV255",
        "nombre": "LLAMA MENDOZA JUAN",
        "fundo": "EL HUERTO",
        "valle": "SANTA",
        "clp": "015-0291-0157",
        "estado": "Activo"
    },
    {
        "id": "PROV256",
        "nombre": "VEGA TOLENTINO HUVEL WILFREDO",
        "fundo": "NVO. PARAISO",
        "valle": "SANTA",
        "clp": "015-0291-0158",
        "estado": "Activo"
    },
    {
        "id": "PROV257",
        "nombre": "GUTIERREZ ALVAREZ GIOVANA",
        "fundo": "BENICS",
        "valle": "SANTA",
        "clp": "015-0291-0159",
        "estado": "Activo"
    },
    {
        "id": "PROV258",
        "nombre": "SILUPU VILCHEZ ASUNCION",
        "fundo": "CRUZ DE CHALPON",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0160",
        "estado": "Activo"
    },
    {
        "id": "PROV259",
        "nombre": "AQUINO SILVA ORLANDO",
        "fundo": "JOSE Y MARIA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0161",
        "estado": "Activo"
    },
    {
        "id": "PROV260",
        "nombre": "PALACIOS PULACHE MERCEDES",
        "fundo": "EL - CHE",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0162",
        "estado": "Activo"
    },
    {
        "id": "PROV261",
        "nombre": "MARQUEZ HERNANDEZ JOSE",
        "fundo": "JOSE",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0163",
        "estado": "Activo"
    },
    {
        "id": "PROV262",
        "nombre": "ELIAS MONTERO JOSE SANTOS",
        "fundo": "ELIAS",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0164",
        "estado": "Activo"
    },
    {
        "id": "PROV263",
        "nombre": "FARFAN CRISANTO NESTOR ROBERTO",
        "fundo": "FARFAN",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0165",
        "estado": "Activo"
    },
    {
        "id": "PROV264",
        "nombre": "SEMINARIO JUAREZ LUCIANO",
        "fundo": "LUCIANO",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0166",
        "estado": "Activo"
    },
    {
        "id": "PROV265",
        "nombre": "AGRICOLA PHOENIX SOCIEDAD ANON",
        "fundo": "PHOENIX",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0167",
        "estado": "Activo"
    },
    {
        "id": "PROV266",
        "nombre": "CORDOVA PULACHE ANTONIO",
        "fundo": "DON ANTONIO",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0168",
        "estado": "Activo"
    },
    {
        "id": "PROV267",
        "nombre": "VILELA MONTERO SEGUNDO OBDULIO",
        "fundo": "CRISTO REY",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0169",
        "estado": "Activo"
    },
    {
        "id": "PROV268",
        "nombre": "RAMOS BORRERO ZOILA ANGELICA",
        "fundo": "ZOILA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0170",
        "estado": "Activo"
    },
    {
        "id": "PROV269",
        "nombre": "VEGA PANTA JOSE JORGE",
        "fundo": "AURORA",
        "valle": "LAS LOMAS",
        "clp": "015-0291-0171",
        "estado": "Activo"
    },
    {
        "id": "PROV270",
        "nombre": "LEON DE NEYRA MARTHA VICTORIA",
        "fundo": "PHOENIX - FRUIT",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0172",
        "estado": "Activo"
    },
    {
        "id": "PROV271",
        "nombre": "CORDOVA PULACHE SEGUNDO",
        "fundo": "ALEJANDRA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0173",
        "estado": "Activo"
    },
    {
        "id": "PROV272",
        "nombre": "CORDOVA GARCIA EVER",
        "fundo": "DON GREGORIO",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0174",
        "estado": "Activo"
    },
    {
        "id": "PROV273",
        "nombre": "NEGOCIOS Y SERVICIOS GENERALES",
        "fundo": "ARMANGO",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0175",
        "estado": "Activo"
    },
    {
        "id": "PROV274",
        "nombre": "SEMINARIO JUAREZ CLAUDIO",
        "fundo": "CLAUDIO",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0176",
        "estado": "Activo"
    },
    {
        "id": "PROV275",
        "nombre": "MORALES JIMENEZ DE JUAREZ FLOR",
        "fundo": "FLORA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0177",
        "estado": "Activo"
    },
    {
        "id": "PROV276",
        "nombre": "CARMEN PANTA ALFONSO",
        "fundo": "CRISTO REY",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0178",
        "estado": "Activo"
    },
    {
        "id": "PROV277",
        "nombre": "MACALUPU DE YOVERA MAGDALENA",
        "fundo": "MAGDALENA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0179",
        "estado": "Activo"
    },
    {
        "id": "PROV278",
        "nombre": "CRISANTO GARCIA LUZ VICTORIA",
        "fundo": "VICTORIA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0180",
        "estado": "Activo"
    },
    {
        "id": "PROV279",
        "nombre": "SEMINARIO JUAREZ CLAUDIO",
        "fundo": "CLAUDIO",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0181",
        "estado": "Activo"
    },
    {
        "id": "PROV280",
        "nombre": "COBEÑAS YESQUEN DOMINGO",
        "fundo": "SANTA ANITA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0182",
        "estado": "Activo"
    },
    {
        "id": "PROV281",
        "nombre": "SOSAYA PALACIOS MARIA CECILIA",
        "fundo": "AGRICOLA GARCIA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0183",
        "estado": "Activo"
    },
    {
        "id": "PROV282",
        "nombre": "DURAND VILCHEZ TEODORO",
        "fundo": "TEODORO",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0184",
        "estado": "Activo"
    },
    {
        "id": "PROV283",
        "nombre": "GARCIA SAAVEDRA MANUEL NEPTALI",
        "fundo": "FLOR DE MARIA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0185",
        "estado": "Activo"
    },
    {
        "id": "PROV284",
        "nombre": "CHAVEZ PALACIOS JAVIER AUGUSTO",
        "fundo": "CHAVEZ",
        "valle": "CHULUCANAS",
        "clp": "015-0291-0186",
        "estado": "Activo"
    },
    {
        "id": "PROV285",
        "nombre": "PACHAMAMA 02",
        "fundo": "PACHAMAMA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0187",
        "estado": "Activo"
    },
    {
        "id": "PROV286",
        "nombre": "PALACIOS MAZA AGUSTO",
        "fundo": "AGUSTO",
        "valle": "MORROPON",
        "clp": "015-0291-0188",
        "estado": "Activo"
    },
    {
        "id": "PROV287",
        "nombre": "AHUMADA BURGOS VICTOR MANUEL",
        "fundo": "SANTA CECILIA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0189",
        "estado": "Activo"
    },
    {
        "id": "PROV288",
        "nombre": "LA CHIRA MACALUPU EDUARDO",
        "fundo": "CHIRA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0190",
        "estado": "Activo"
    },
    {
        "id": "PROV289",
        "nombre": "REQUENA MENDOZA VICTOR SANTIAG",
        "fundo": "SANTIAGO ESTEBAN",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0191",
        "estado": "Activo"
    },
    {
        "id": "PROV290",
        "nombre": "CORDOVA PULACHE ANTONIO",
        "fundo": "DON ANTONIO",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0192",
        "estado": "Activo"
    },
    {
        "id": "PROV291",
        "nombre": "CARMEN VILLEGAS RAUL",
        "fundo": "DAMARIS",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0193",
        "estado": "Activo"
    },
    {
        "id": "PROV292",
        "nombre": "YOVERA RAMOS MERCEDES",
        "fundo": "YOVERA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0194",
        "estado": "Activo"
    },
    {
        "id": "PROV293",
        "nombre": "OJEDA PALACIOS LUIS",
        "fundo": "OJEDA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0195",
        "estado": "Activo"
    },
    {
        "id": "PROV294",
        "nombre": "IPANAQUE VILCHEZ JOSE ERASMO",
        "fundo": "IPANAQUE",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0196",
        "estado": "Activo"
    },
    {
        "id": "PROV295",
        "nombre": "SALAZAR MENDOZA EULOGIO",
        "fundo": "EULOGIO",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0197",
        "estado": "Activo"
    },
    {
        "id": "PROV296",
        "nombre": "SILUPU GARCIA ALCIDES",
        "fundo": "CARREÑO",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0198",
        "estado": "Activo"
    },
    {
        "id": "PROV297",
        "nombre": "CORDOVA PULACHE MARTIN",
        "fundo": "MACUA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0199",
        "estado": "Activo"
    },
    {
        "id": "PROV298",
        "nombre": "ALAMA YMAN JOSE HORACIO",
        "fundo": "HORACIO",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0200",
        "estado": "Activo"
    },
    {
        "id": "PROV299",
        "nombre": "NAMUCHE FLORES JOSE SATURDINO",
        "fundo": "SATURDINO",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0201",
        "estado": "Activo"
    },
    {
        "id": "PROV300",
        "nombre": "SERNAQUE SERNAQUE FELIX CRUZ",
        "fundo": "AGRICOLA CRUZ",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0202",
        "estado": "Activo"
    },
    {
        "id": "PROV301",
        "nombre": "PANTA CARREÑO LUIS",
        "fundo": "DON PANTA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0203",
        "estado": "Activo"
    },
    {
        "id": "PROV302",
        "nombre": "PULACHE GIRON AUGUSTIN",
        "fundo": "AGUSTIN",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0204",
        "estado": "Activo"
    },
    {
        "id": "PROV303",
        "nombre": "ORTIZ FLORES DORA ANDREA",
        "fundo": "FLORES",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0205",
        "estado": "Activo"
    },
    {
        "id": "PROV304",
        "nombre": "PANTA CARREÑO HORTENCIO",
        "fundo": "ESTEFANY",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0206",
        "estado": "Activo"
    },
    {
        "id": "PROV305",
        "nombre": "SEMINARIO JUAREZ LUCIANO",
        "fundo": "LUCIO FERNANDO",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0207",
        "estado": "Activo"
    },
    {
        "id": "PROV306",
        "nombre": "TORRES MACALUPU MARIA JUANA",
        "fundo": "GERRAL",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0208",
        "estado": "Activo"
    },
    {
        "id": "PROV307",
        "nombre": "PACHAMAMA - PLANTA",
        "fundo": "PACHAMAMA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0209",
        "estado": "Activo"
    },
    {
        "id": "PROV308",
        "nombre": "ELIAS YESQUEN DIONILA",
        "fundo": "MACALUPU",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0210",
        "estado": "Activo"
    },
    {
        "id": "PROV309",
        "nombre": "PANTA CARREÑO HORTENCIO",
        "fundo": "ESTEFANY",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0211",
        "estado": "Activo"
    },
    {
        "id": "PROV310",
        "nombre": "CORDOVA PULACHE SEGUNDO",
        "fundo": "ALEJANDRA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0212",
        "estado": "Activo"
    },
    {
        "id": "PROV311",
        "nombre": "YPANAQUE YMAN JUAN",
        "fundo": "JOSE JULIO",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0213",
        "estado": "Activo"
    },
    {
        "id": "PROV312",
        "nombre": "RAMOS YOVERA MERY",
        "fundo": "JEHOVA JIRED",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0214",
        "estado": "Activo"
    },
    {
        "id": "PROV313",
        "nombre": "AGUILAR ROMERO LUIS FRANCISCO",
        "fundo": "AGUILAR",
        "valle": "HUARMEY",
        "clp": "015-0291-0215",
        "estado": "Activo"
    },
    {
        "id": "PROV314",
        "nombre": "PAJUELO CAMONES NORA ADELAIDA",
        "fundo": "ALMENDRA",
        "valle": "HUARMEY",
        "clp": "015-0291-0216",
        "estado": "Activo"
    },
    {
        "id": "PROV315",
        "nombre": "MAGUIÑA YAURI ANUNCIACION ENCARNACION",
        "fundo": "YAURI",
        "valle": "HUARMEY",
        "clp": "015-0291-0217",
        "estado": "Activo"
    },
    {
        "id": "PROV316",
        "nombre": "CAMONES ROMERO MARIA CARMEN CRISTINA",
        "fundo": "CRISS",
        "valle": "HUARMEY",
        "clp": "015-0291-0218",
        "estado": "Activo"
    },
    {
        "id": "PROV317",
        "nombre": "INOCENTE MENA ALEJANDRO CLEMEN",
        "fundo": "INOCENTE",
        "valle": "HUARMEY",
        "clp": "015-0291-0219",
        "estado": "Activo"
    },
    {
        "id": "PROV318",
        "nombre": "MILLA GUERRERO PAULINA ESPERAN",
        "fundo": "GARCIA",
        "valle": "CASMA",
        "clp": "015-0291-0220",
        "estado": "Activo"
    },
    {
        "id": "PROV319",
        "nombre": "ESTRADA INFANTES GERARDO JULIO",
        "fundo": "ESTRADA INFANTE",
        "valle": "CASMA",
        "clp": "015-0291-0221",
        "estado": "Activo"
    },
    {
        "id": "PROV320",
        "nombre": "ESTRADA INFANTES ZENOBIO LEONC",
        "fundo": "ESTRADA",
        "valle": "CASMA",
        "clp": "015-0291-0222",
        "estado": "Activo"
    },
    {
        "id": "PROV321",
        "nombre": "ESPINOZA ROMERO FILBERTO",
        "fundo": "FILBERTO",
        "valle": "CASMA",
        "clp": "015-0291-0223",
        "estado": "Activo"
    },
    {
        "id": "PROV322",
        "nombre": "ESTRADA INFANTES ZENOBIO LEONC",
        "fundo": "ESTRADA",
        "valle": "CASMA",
        "clp": "015-0291-0224",
        "estado": "Activo"
    },
    {
        "id": "PROV323",
        "nombre": "COLONIA VDA DE VALVERDE LEONAR",
        "fundo": "LEONARDA",
        "valle": "CASMA",
        "clp": "015-0291-0225",
        "estado": "Activo"
    },
    {
        "id": "PROV324",
        "nombre": "VILCHEZ ANASTACIO AUGUSTO",
        "fundo": "VILCHEZ",
        "valle": "CASMA",
        "clp": "015-0291-0226",
        "estado": "Activo"
    },
    {
        "id": "PROV325",
        "nombre": "TAMARA MORENO VICTOR HUGO",
        "fundo": "TAMARA",
        "valle": "CASMA",
        "clp": "015-0291-0227",
        "estado": "Activo"
    },
    {
        "id": "PROV326",
        "nombre": "TAMARA MORENO VICTOR HUGO",
        "fundo": "TAMARA",
        "valle": "CASMA",
        "clp": "015-0291-0228",
        "estado": "Activo"
    },
    {
        "id": "PROV327",
        "nombre": "BAUTISTA ROSALES ALEJANDRO LEO",
        "fundo": "BAUTISTA",
        "valle": "CASMA",
        "clp": "015-0291-0229",
        "estado": "Activo"
    },
    {
        "id": "PROV328",
        "nombre": "LOPEZ MIRANDA FRANCISCO REYNER",
        "fundo": "LOPEZ",
        "valle": "CASMA",
        "clp": "015-0291-0230",
        "estado": "Activo"
    },
    {
        "id": "PROV329",
        "nombre": "GOMEZ LAZARO ROMELIA FELICITA",
        "fundo": "ROMELIA",
        "valle": "CASMA",
        "clp": "015-0291-0231",
        "estado": "Activo"
    },
    {
        "id": "PROV330",
        "nombre": "ROJAS BENITES JESUS TERESA",
        "fundo": "TERESA",
        "valle": "CASMA",
        "clp": "015-0291-0232",
        "estado": "Activo"
    },
    {
        "id": "PROV331",
        "nombre": "TORRES FLORES CEVERINO ALEJAND",
        "fundo": "TORRES",
        "valle": "CASMA",
        "clp": "015-0291-0233",
        "estado": "Activo"
    },
    {
        "id": "PROV332",
        "nombre": "ZUÑIGA PATRICIO SATURNINO BERN",
        "fundo": "ZUÑIGA",
        "valle": "CASMA",
        "clp": "015-0291-0234",
        "estado": "Activo"
    },
    {
        "id": "PROV333",
        "nombre": "CHAMARA CORONACION JULISSA MAR",
        "fundo": "CHAMARRA",
        "valle": "CASMA",
        "clp": "015-0291-0235",
        "estado": "Activo"
    },
    {
        "id": "PROV334",
        "nombre": "CONGO CUTAMANCA ALFREDO ARTEMI",
        "fundo": "CONGO",
        "valle": "CASMA",
        "clp": "015-0291-0236",
        "estado": "Activo"
    },
    {
        "id": "PROV335",
        "nombre": "GARCIA AYALA CARLOS DOMINGO",
        "fundo": "GARCIA",
        "valle": "CASMA",
        "clp": "015-0291-0237",
        "estado": "Activo"
    },
    {
        "id": "PROV336",
        "nombre": "GARCIA RIMAY SANTOS JUAN",
        "fundo": "RIMAY",
        "valle": "CASMA",
        "clp": "015-0291-0238",
        "estado": "Activo"
    },
    {
        "id": "PROV337",
        "nombre": "QUIROZ ABAL JHONNY DANTE",
        "fundo": "QUIROZ",
        "valle": "CASMA",
        "clp": "015-0291-0239",
        "estado": "Activo"
    },
    {
        "id": "PROV338",
        "nombre": "CABRERA CONDOR FRANCISCA",
        "fundo": "CABRERA",
        "valle": "CASMA",
        "clp": "015-0291-0240",
        "estado": "Activo"
    },
    {
        "id": "PROV339",
        "nombre": "GUERRERO HUACAY INES MAGALI",
        "fundo": "HUACAY",
        "valle": "CASMA",
        "clp": "015-0291-0241",
        "estado": "Activo"
    },
    {
        "id": "PROV340",
        "nombre": "GUERRERO HUALLPAHUAQUE NORMA Z",
        "fundo": "HUALLPAHUAQUE",
        "valle": "CASMA",
        "clp": "015-0291-0242",
        "estado": "Activo"
    },
    {
        "id": "PROV341",
        "nombre": "GUILLEN PAJUELO NELSON MANUEL",
        "fundo": "PAJUELO",
        "valle": "CASMA",
        "clp": "015-0291-0243",
        "estado": "Activo"
    },
    {
        "id": "PROV342",
        "nombre": "NICOLAS CASTRO HERNAN ALBERTO",
        "fundo": "NICOLAS",
        "valle": "CASMA",
        "clp": "015-0291-0244",
        "estado": "Activo"
    },
    {
        "id": "PROV343",
        "nombre": "SHICSHI BERNALDO PAULINA ZENEI",
        "fundo": "SHICSHI",
        "valle": "CASMA",
        "clp": "015-0291-0245",
        "estado": "Activo"
    },
    {
        "id": "PROV344",
        "nombre": "MORALES ROSALES VERONICA JEANN",
        "fundo": "MORALES",
        "valle": "CASMA",
        "clp": "015-0291-0246",
        "estado": "Activo"
    },
    {
        "id": "PROV345",
        "nombre": "CABELLO VEGA BERNABE FORTUNATO",
        "fundo": "CABELLO",
        "valle": "CASMA",
        "clp": "015-0291-0247",
        "estado": "Activo"
    },
    {
        "id": "PROV346",
        "nombre": "GUERRERO LEON YOLANDA FELICITA",
        "fundo": "GUERRERO",
        "valle": "CASMA",
        "clp": "015-0291-0248",
        "estado": "Activo"
    },
    {
        "id": "PROV347",
        "nombre": "PAJUELO YERBASANTA YESSICA JAN",
        "fundo": "PAJUELO",
        "valle": "CASMA",
        "clp": "015-0291-0249",
        "estado": "Activo"
    },
    {
        "id": "PROV348",
        "nombre": "VEGA OLORTEGUI ROLANDO",
        "fundo": "VEGA",
        "valle": "CASMA",
        "clp": "015-0291-0250",
        "estado": "Activo"
    },
    {
        "id": "PROV349",
        "nombre": "ABAL JARA JESUS GENARO",
        "fundo": "ABAL",
        "valle": "CASMA",
        "clp": "015-0291-0251",
        "estado": "Activo"
    },
    {
        "id": "PROV350",
        "nombre": "RODRIGUEZ LEON ANGEL JHONY",
        "fundo": "RODRIGUEZ",
        "valle": "CASMA",
        "clp": "015-0291-0252",
        "estado": "Activo"
    },
    {
        "id": "PROV351",
        "nombre": "QUIROZ LOPEZ ERNESTO",
        "fundo": "QUIROZ",
        "valle": "CASMA",
        "clp": "015-0291-0253",
        "estado": "Activo"
    },
    {
        "id": "PROV352",
        "nombre": "GARCIA JARA JHON ALEJANDRO",
        "fundo": "GARCIA",
        "valle": "CASMA",
        "clp": "015-0291-0254",
        "estado": "Activo"
    },
    {
        "id": "PROV353",
        "nombre": "SIMEON CASIO PABLO ROBERTO",
        "fundo": "CASIO",
        "valle": "CASMA",
        "clp": "015-0291-0255",
        "estado": "Activo"
    },
    {
        "id": "PROV354",
        "nombre": "PAJUELO SANCHEZ ANDRES",
        "fundo": "PAJUELO",
        "valle": "CASMA",
        "clp": "015-0291-0256",
        "estado": "Activo"
    },
    {
        "id": "PROV355",
        "nombre": "CHACON ALCANTARA EDDI YURI",
        "fundo": "CHACON",
        "valle": "CASMA",
        "clp": "015-0291-0257",
        "estado": "Activo"
    },
    {
        "id": "PROV356",
        "nombre": "GUILLEN ABAL HILBER JHOEL",
        "fundo": "GUILLEN",
        "valle": "CASMA",
        "clp": "015-0291-0258",
        "estado": "Activo"
    },
    {
        "id": "PROV357",
        "nombre": "ESPICHAN HIDALGO IVAN ALEX",
        "fundo": "ESPICHAN",
        "valle": "CASMA",
        "clp": "015-0291-0259",
        "estado": "Activo"
    },
    {
        "id": "PROV358",
        "nombre": "MILLA GUERRERO FRANCISCO BRIGI",
        "fundo": "MILLA",
        "valle": "CASMA",
        "clp": "015-0291-0260",
        "estado": "Activo"
    },
    {
        "id": "PROV359",
        "nombre": "QUIROZ LOPEZ PEDRO ROSARIO",
        "fundo": "QUIROZ",
        "valle": "CASMA",
        "clp": "015-0291-0261",
        "estado": "Activo"
    },
    {
        "id": "PROV360",
        "nombre": "LOPEZ DE GOMEZ YOLANDA ESPERAN",
        "fundo": "LOPEZ",
        "valle": "CASMA",
        "clp": "015-0291-0262",
        "estado": "Activo"
    },
    {
        "id": "PROV361",
        "nombre": "CRUZ CABALLERO TEOFILO",
        "fundo": "CRUZ",
        "valle": "CASMA",
        "clp": "015-0291-0263",
        "estado": "Activo"
    },
    {
        "id": "PROV362",
        "nombre": "ABAL GARAY MAXIMO HIPOLITO",
        "fundo": "ABAL",
        "valle": "CASMA",
        "clp": "015-0291-0264",
        "estado": "Activo"
    },
    {
        "id": "PROV363",
        "nombre": "BLANCO ZEGARRA LUIS MIGUEL",
        "fundo": "BLANCO",
        "valle": "CASMA",
        "clp": "015-0291-0265",
        "estado": "Activo"
    },
    {
        "id": "PROV364",
        "nombre": "LLANTO CABELLO JUAN EMILIANO",
        "fundo": "LLANTO",
        "valle": "CASMA",
        "clp": "015-0291-0266",
        "estado": "Activo"
    },
    {
        "id": "PROV365",
        "nombre": "ARANIBAL GUERRERO CESAR GLICER",
        "fundo": "A&CH",
        "valle": "CASMA",
        "clp": "015-0291-0267",
        "estado": "Activo"
    },
    {
        "id": "PROV366",
        "nombre": "ARANIBAL GUERRERO BERNABE RIVE",
        "fundo": "A&CH",
        "valle": "CASMA",
        "clp": "015-0291-0268",
        "estado": "Activo"
    },
    {
        "id": "PROV367",
        "nombre": "MENDEZ CASHPA JOSUE ROGELIO",
        "fundo": "MENDEZ",
        "valle": "CASMA",
        "clp": "015-0291-0269",
        "estado": "Activo"
    },
    {
        "id": "PROV368",
        "nombre": "MENDEZ TRINIDAD MAXIMO REYMUND",
        "fundo": "MENDEZ",
        "valle": "CASMA",
        "clp": "015-0291-0270",
        "estado": "Activo"
    },
    {
        "id": "PROV369",
        "nombre": "BARTOLOME CASIMIRO ELISEO BASI",
        "fundo": "BARTOLOME",
        "valle": "CASMA",
        "clp": "015-0291-0271",
        "estado": "Activo"
    },
    {
        "id": "PROV370",
        "nombre": "TRINIDAD CASIO HERMINIO SEGUND",
        "fundo": "TRINIDAD",
        "valle": "CASMA",
        "clp": "015-0291-0272",
        "estado": "Activo"
    },
    {
        "id": "PROV371",
        "nombre": "JARA TRINIDAD ROBERTO PEDRO",
        "fundo": "JARA",
        "valle": "CASMA",
        "clp": "015-0291-0273",
        "estado": "Activo"
    },
    {
        "id": "PROV372",
        "nombre": "JARA PAJUELO MEDALIA GUMERCIND",
        "fundo": "JARA",
        "valle": "CASMA",
        "clp": "015-0291-0274",
        "estado": "Activo"
    },
    {
        "id": "PROV373",
        "nombre": "CUTAMANCA SANTAMARIA EUGENIO P",
        "fundo": "CUTAMANCA",
        "valle": "CASMA",
        "clp": "015-0291-0275",
        "estado": "Activo"
    },
    {
        "id": "PROV374",
        "nombre": "CHINCHAY GUERRERO PAULINO LINO",
        "fundo": "A&CH",
        "valle": "CASMA",
        "clp": "015-0291-0276",
        "estado": "Activo"
    },
    {
        "id": "PROV375",
        "nombre": "ARANIBAL GUERRERO BERNABE RIVE",
        "fundo": "A&CH",
        "valle": "CASMA",
        "clp": "015-0291-0277",
        "estado": "Activo"
    },
    {
        "id": "PROV376",
        "nombre": "ASOCIACION FRATERNITAS DEL PER",
        "fundo": "ALBANOVA",
        "valle": "CASMA",
        "clp": "015-0291-0278",
        "estado": "Activo"
    },
    {
        "id": "PROV377",
        "nombre": "PEÑA GARCIA DOLIBEETH",
        "fundo": "PEÑA",
        "valle": "CASMA",
        "clp": "015-0291-0279",
        "estado": "Activo"
    },
    {
        "id": "PROV378",
        "nombre": "TAMARA GARCIA ESPERANZA BERNAR",
        "fundo": "TAMARA",
        "valle": "CASMA",
        "clp": "015-0291-0280",
        "estado": "Activo"
    },
    {
        "id": "PROV379",
        "nombre": "PAJUELO SANCHEZ CARLOS VICTORI",
        "fundo": "PAJUELO",
        "valle": "CASMA",
        "clp": "015-0291-0281",
        "estado": "Activo"
    },
    {
        "id": "PROV380",
        "nombre": "QUIROZ LOPEZ GILBERTO ESTEBAN",
        "fundo": "QUIROZ",
        "valle": "CASMA",
        "clp": "015-0291-0282",
        "estado": "Activo"
    },
    {
        "id": "PROV381",
        "nombre": "LAZARO MONTEZA CESAR",
        "fundo": "LAZARO",
        "valle": "CASMA",
        "clp": "015-0291-0283",
        "estado": "Activo"
    },
    {
        "id": "PROV382",
        "nombre": "DE LA CRUZ RAMIREZ OSCAR JULIAN",
        "fundo": "DE LA CRUZ",
        "valle": "CASMA",
        "clp": "015-0291-0284",
        "estado": "Activo"
    },
    {
        "id": "PROV383",
        "nombre": "SIMEON VARGAS MARTHA LIDIA",
        "fundo": "SIMEON",
        "valle": "CASMA",
        "clp": "015-0291-0285",
        "estado": "Activo"
    },
    {
        "id": "PROV384",
        "nombre": "MARTINEZ HUARCA TIMOTEO FELICI",
        "fundo": "MARTINEZ",
        "valle": "CASMA",
        "clp": "015-0291-0286",
        "estado": "Activo"
    },
    {
        "id": "PROV385",
        "nombre": "CHINCHAY GUERRERO HERMELINDA MÁXIMINA",
        "fundo": "A&CH",
        "valle": "CASMA",
        "clp": "015-0291-0287",
        "estado": "Activo"
    },
    {
        "id": "PROV386",
        "nombre": "MISHTI SALAZAR GRACIELA MAGLORIA",
        "fundo": "A&CH",
        "valle": "CASMA",
        "clp": "015-0291-0288",
        "estado": "Activo"
    },
    {
        "id": "PROV387",
        "nombre": "ARANIBAL GUERRERO CESAR GLICER",
        "fundo": "A&CH",
        "valle": "CASMA",
        "clp": "015-0291-0289",
        "estado": "Activo"
    },
    {
        "id": "PROV388",
        "nombre": "ALEGRE LLANTO LUIS BERTINO",
        "fundo": "ALEGRE",
        "valle": "CASMA",
        "clp": "015-0291-0290",
        "estado": "Activo"
    },
    {
        "id": "PROV389",
        "nombre": "CONSOLACION CASIO ANA RODE",
        "fundo": "CONSOLACION",
        "valle": "CASMA",
        "clp": "015-0291-0291",
        "estado": "Activo"
    },
    {
        "id": "PROV390",
        "nombre": "PEREZ SANCHEZ FELIX ANTONIO",
        "fundo": "PEREZ",
        "valle": "CASMA",
        "clp": "015-0291-0292",
        "estado": "Activo"
    },
    {
        "id": "PROV391",
        "nombre": "CAPELLAN NUÑEZ WILDER VIRGILIO",
        "fundo": "CAPELLAN",
        "valle": "CASMA",
        "clp": "015-0291-0293",
        "estado": "Activo"
    },
    {
        "id": "PROV392",
        "nombre": "BLANCO OSORIO MICHEL JAVIER",
        "fundo": "BLANCO",
        "valle": "CASMA",
        "clp": "015-0291-0294",
        "estado": "Activo"
    },
    {
        "id": "PROV393",
        "nombre": "CAPELLAN NUÑEZ WILDER VIRGILIO",
        "fundo": "CAPELLAN",
        "valle": "CASMA",
        "clp": "015-0291-0295",
        "estado": "Activo"
    },
    {
        "id": "PROV394",
        "nombre": "CAPELLAN NATIVIDAD PABLO",
        "fundo": "CAPELLAN",
        "valle": "CASMA",
        "clp": "015-0291-0296",
        "estado": "Activo"
    },
    {
        "id": "PROV395",
        "nombre": "JARA PAJUELO MARIA FELICITA",
        "fundo": "JARA",
        "valle": "CASMA",
        "clp": "015-0291-0297",
        "estado": "Activo"
    },
    {
        "id": "PROV396",
        "nombre": "YERBASANTA HUALANCHO ROSNER RENATO",
        "fundo": "YERBASANTA",
        "valle": "CASMA",
        "clp": "015-0291-0298",
        "estado": "Activo"
    },
    {
        "id": "PROV397",
        "nombre": "YERBASANTA CARBAJO ADOLFO",
        "fundo": "YERBASANTA",
        "valle": "CASMA",
        "clp": "015-0291-0299",
        "estado": "Activo"
    },
    {
        "id": "PROV398",
        "nombre": "JARA LLANTO DAVID ROBERT",
        "fundo": "JARA",
        "valle": "CASMA",
        "clp": "015-0291-0300",
        "estado": "Activo"
    },
    {
        "id": "PROV399",
        "nombre": "DIAZ CANO GABRIEL MARINO",
        "fundo": "DIAZ",
        "valle": "CASMA",
        "clp": "015-0291-0301",
        "estado": "Activo"
    },
    {
        "id": "PROV400",
        "nombre": "SANTIAGO CALDAS JULIAN LEONCIO",
        "fundo": "SANTIAGO",
        "valle": "CASMA",
        "clp": "015-0291-0302",
        "estado": "Activo"
    },
    {
        "id": "PROV401",
        "nombre": "BARRERA ARANDA DE DIAZ VILMA A",
        "fundo": "BARRERA",
        "valle": "CASMA",
        "clp": "015-0291-0303",
        "estado": "Activo"
    },
    {
        "id": "PROV402",
        "nombre": "CAPELLAN NATIVIDAD PABLO",
        "fundo": "CAPELLAN",
        "valle": "CASMA",
        "clp": "015-0291-0304",
        "estado": "Activo"
    },
    {
        "id": "PROV403",
        "nombre": "CAPELLAN NATIVIDAD PABLO",
        "fundo": "CAPELLAN",
        "valle": "CASMA",
        "clp": "015-0291-0305",
        "estado": "Activo"
    },
    {
        "id": "PROV404",
        "nombre": "ROJAS BENITES JUAN PAULINO",
        "fundo": "ROJAS",
        "valle": "CASMA",
        "clp": "015-0291-0306",
        "estado": "Activo"
    },
    {
        "id": "PROV405",
        "nombre": "VEGA MENDOZA JULIO ANGEL",
        "fundo": "VEGA",
        "valle": "CASMA",
        "clp": "015-0291-0307",
        "estado": "Activo"
    },
    {
        "id": "PROV406",
        "nombre": "LOPEZ BARRERA CARLOS ANTONIO",
        "fundo": "CHANQUILLO",
        "valle": "CASMA",
        "clp": "015-0291-0308",
        "estado": "Activo"
    },
    {
        "id": "PROV407",
        "nombre": "ACUÑA OCAÑA PAULET YANATI",
        "fundo": "ACUÑA",
        "valle": "CASMA",
        "clp": "015-0291-0309",
        "estado": "Activo"
    },
    {
        "id": "PROV408",
        "nombre": "DOMINGUEZ MANRIQUE ADELAIDA BE",
        "fundo": "DOMINGUEZ",
        "valle": "CASMA",
        "clp": "015-0291-0310",
        "estado": "Activo"
    },
    {
        "id": "PROV409",
        "nombre": "PRADO CONSOLACION GREGORIO EST",
        "fundo": "PRADO",
        "valle": "CASMA",
        "clp": "015-0291-0311",
        "estado": "Activo"
    },
    {
        "id": "PROV410",
        "nombre": "TAMARA COLONIA LANDO CORNELIO",
        "fundo": "TAMARA",
        "valle": "CASMA",
        "clp": "015-0291-0312",
        "estado": "Activo"
    },
    {
        "id": "PROV411",
        "nombre": "RAMIREZ ARAUCANO DOMITILA",
        "fundo": "RAMIREZ",
        "valle": "CASMA",
        "clp": "015-0291-0313",
        "estado": "Activo"
    },
    {
        "id": "PROV412",
        "nombre": "JARA LLANTO OFELIA AZUCENA",
        "fundo": "JARA LLANTO",
        "valle": "CASMA",
        "clp": "015-0291-0314",
        "estado": "Activo"
    },
    {
        "id": "PROV413",
        "nombre": "PAREDES HUALANCHO NICANOR GUIL",
        "fundo": "PAREDES",
        "valle": "CASMA",
        "clp": "015-0291-0315",
        "estado": "Activo"
    },
    {
        "id": "PROV414",
        "nombre": "JARA PAJUELO MAXIMO CARLOS",
        "fundo": "JARA PAJUELO",
        "valle": "CASMA",
        "clp": "015-0291-0316",
        "estado": "Activo"
    },
    {
        "id": "PROV415",
        "nombre": "CORDOVA GIRON JOHN HAROLD",
        "fundo": "JEHOVA PROVERA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0317",
        "estado": "Activo"
    },
    {
        "id": "PROV416",
        "nombre": "PACHAMAMA - SANTA BARBARA",
        "fundo": "SANTA BARBARA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0318",
        "estado": "Activo"
    },
    {
        "id": "PROV417",
        "nombre": "BURGOS BLANCO ROSARIO",
        "fundo": "N/A",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0319",
        "estado": "Activo"
    },
    {
        "id": "PROV418",
        "nombre": "PAICO ESTRADA JOSE JUSTO",
        "fundo": "ESTRADA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0320",
        "estado": "Activo"
    },
    {
        "id": "PROV419",
        "nombre": "VILLEGAS MACALUPU CARLOS",
        "fundo": "HORTALIZA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0321",
        "estado": "Activo"
    },
    {
        "id": "PROV420",
        "nombre": "CHIROQUE SANDOVAL GERARDO",
        "fundo": "MI MARY",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0322",
        "estado": "Activo"
    },
    {
        "id": "PROV421",
        "nombre": "BARBA DE ROA JOSEFINA",
        "fundo": "LILIANA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0323",
        "estado": "Activo"
    },
    {
        "id": "PROV422",
        "nombre": "AGRICOLA YUSCAY SAC",
        "fundo": "AGRICOLA YUSCAY",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0324",
        "estado": "Activo"
    },
    {
        "id": "PROV423",
        "nombre": "GARCIA DE CASTRO MARIA IGNACIA",
        "fundo": "IGNACIA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0325",
        "estado": "Activo"
    },
    {
        "id": "PROV424",
        "nombre": "FLORES SALES JORGE",
        "fundo": "FLORES",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0326",
        "estado": "Activo"
    },
    {
        "id": "PROV425",
        "nombre": "CHERO YPANAQUE MARIA PAULINA",
        "fundo": "CAMILO",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0327",
        "estado": "Activo"
    },
    {
        "id": "PROV426",
        "nombre": "PANTALEON CHUNGA JOSE",
        "fundo": "SAN JOSE",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0328",
        "estado": "Activo"
    },
    {
        "id": "PROV427",
        "nombre": "PAZ BERECHE GERTRUDIS",
        "fundo": "GERTRUDIS",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0329",
        "estado": "Activo"
    },
    {
        "id": "PROV428",
        "nombre": "JUAREZ MONTERO SANTOS",
        "fundo": "SANTA ROSA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0330",
        "estado": "Activo"
    },
    {
        "id": "PROV429",
        "nombre": "NEGOCIOS GENERALES ESTRELLA E.I.R.L.",
        "fundo": "ESTRELLA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0331",
        "estado": "Activo"
    },
    {
        "id": "PROV430",
        "nombre": "ROJAS JUAREZ PAULA JAJAIRA",
        "fundo": "N/A",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0332",
        "estado": "Activo"
    },
    {
        "id": "PROV431",
        "nombre": "JIMENEZ RUIZ SERGIO",
        "fundo": "GODOFREDO",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0333",
        "estado": "Activo"
    },
    {
        "id": "PROV432",
        "nombre": "VEGA VEGA ELVER",
        "fundo": "LORENA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0334",
        "estado": "Activo"
    },
    {
        "id": "PROV433",
        "nombre": "ROSALES CERROS GLIDEN",
        "fundo": "N/A",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0335",
        "estado": "Activo"
    },
    {
        "id": "PROV434",
        "nombre": "DURAND IPANAQUE JUAN PABLO",
        "fundo": "RECUERDO",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0336",
        "estado": "Activo"
    },
    {
        "id": "PROV435",
        "nombre": "JUAREZ MONTERO JAVIER",
        "fundo": "SANTA ROSA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0337",
        "estado": "Activo"
    },
    {
        "id": "PROV436",
        "nombre": "FLORES DE IPANAQUE ROSA",
        "fundo": "DON ERASMO",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0338",
        "estado": "Activo"
    },
    {
        "id": "PROV437",
        "nombre": "MACALUPU PAZ ISIDORO",
        "fundo": "LA ENCANTADA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0339",
        "estado": "Activo"
    },
    {
        "id": "PROV438",
        "nombre": "COVEÑAS MENDOZA MARIA MERCEDES",
        "fundo": "MARIA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0340",
        "estado": "Activo"
    },
    {
        "id": "PROV439",
        "nombre": "ROA LLACSAHUACHE JOAQUIN SEGUNDO",
        "fundo": "JOAQUIN",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0341",
        "estado": "Activo"
    },
    {
        "id": "PROV440",
        "nombre": "MENDOZA YOVERA LAZARO",
        "fundo": "LAZARO",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0342",
        "estado": "Activo"
    },
    {
        "id": "PROV441",
        "nombre": "IPANAQUE CHIROQUE JUAN CRUZ",
        "fundo": "SIEMPRE MANUEL",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0343",
        "estado": "Activo"
    },
    {
        "id": "PROV442",
        "nombre": "NEGOCIOS GENERALES ESTRELLA E.I.R.L.",
        "fundo": "ESTRELLA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0344",
        "estado": "Activo"
    },
    {
        "id": "PROV443",
        "nombre": "CHANTA FLORES ANDRES",
        "fundo": "CHANTA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0345",
        "estado": "Activo"
    },
    {
        "id": "PROV444",
        "nombre": "MUÑOZ OSORIO RUBEN EVER",
        "fundo": "R Y M",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0346",
        "estado": "Activo"
    },
    {
        "id": "PROV445",
        "nombre": "DURAND VILCHEZ MARIA EMILIA",
        "fundo": "MARIA EMILIA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0347",
        "estado": "Activo"
    },
    {
        "id": "PROV446",
        "nombre": "SILUPU SERNAQUE HENRY",
        "fundo": "HENRY",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0348",
        "estado": "Activo"
    },
    {
        "id": "PROV447",
        "nombre": "JUAREZ DIAZ MIGUEL",
        "fundo": "ANITA",
        "valle": "TAMBOGRANDE",
        "clp": "015-0291-0349",
        "estado": "Activo"
    }
],
    variedades: [
    {
        "id": "VAR001",
        "producto": "MANGO",
        "nombre": "KENT",
        "estado": "Activo"
    },
    {
        "id": "VAR002",
        "producto": "MANGO",
        "nombre": "KEITT",
        "estado": "Activo"
    },
    {
        "id": "VAR003",
        "producto": "MANGO",
        "nombre": "EDWARD",
        "estado": "Activo"
    },
    {
        "id": "VAR004",
        "producto": "MANGO",
        "nombre": "TALI",
        "estado": "Activo"
    },
    {
        "id": "VAR005",
        "producto": "PALTA",
        "nombre": "HASS",
        "estado": "Activo"
    },
    {
        "id": "VAR006",
        "producto": "PALTA",
        "nombre": "SHELLY",
        "estado": "Activo"
    },
    {
        "id": "VAR007",
        "producto": "LIMON",
        "nombre": "SUTIL",
        "estado": "Activo"
    },
    {
        "id": "VAR007",
        "producto": "LIMON",
        "nombre": "TAHITI",
        "estado": "Activo"
    }
],
    productos: [
    {
        "id": "MPD001",
        "nombre": "MANGO",
        "estado": "Activo"
    },
    {
        "id": "MPD002",
        "nombre": "PALTA",
        "estado": "Activo"
    },
    {
        "id": "MPD003",
        "nombre": "LIMON",
        "estado": "Activo"
    }
],
    supervisores: [
    {
        "id":  "SUP01",
        "nombre":  "Carlos Ruiz",
        "dni":  "10293847",
        "pin":  "1111",
        "estado":  "Activo"
    },
    {
        "id":  "SUP02",
        "nombre":  "Ana Gomez",
        "dni":  "20394857",
        "pin":  "2222",
        "estado":  "Activo"
    },
    {
        "id":  "SUP03",
        "nombre":  "Pedro Castro",
        "dni":  "30495867",
        "pin":  "3333",
        "estado":  "Activo"
    },
    {
        "id":  "SUP04",
        "nombre":  "Cecilia",
        "dni":  "40596877",
        "pin":  "4444",
        "estado":  "Activo"
    },
    {
        "id":  "SUP05",
        "nombre":  "Cristian",
        "dni":  "50697887",
        "pin":  "5555",
        "estado":  "Activo"
    }
],
    grupos: [
    {
        "id": "G001",
        "codigo_grupo": "Grupo 1 Recepción",
        "area_proceso": "Recepción",
        "supervisor_id": "Carlos Ruiz",
        "turno_habitual": "Día",
        "estado": "Activo"
    },
    {
        "id": "G002",
        "codigo_grupo": "Grupo 2 Calibrado",
        "area_proceso": "Calibrado",
        "supervisor_id": "Ana Gomez",
        "turno_habitual": "Día",
        "estado": "Activo"
    },
    {
        "id": "G003",
        "codigo_grupo": "Grupo 3 Calibrado",
        "area_proceso": "Calibrado",
        "supervisor_id": "Ana Gomez",
        "turno_habitual": "Noche",
        "estado": "Activo"
    },
    {
        "id": "G004",
        "codigo_grupo": "Grupo 4 Empaque",
        "area_proceso": "Empaque",
        "supervisor_id": "Cecilia",
        "turno_habitual": "Noche",
        "estado": "Activo"
    },
    {
        "id": "G005",
        "codigo_grupo": "Grupo 5 Empaque",
        "area_proceso": "Empaque",
        "supervisor_id": "Cristian",
        "turno_habitual": "Noche",
        "estado": "Activo"
    },
    {
        "id": "G006",
        "codigo_grupo": "Grupo 6 Hidrotérmico",
        "area_proceso": "Tratamiento Hidrotérmico",
        "supervisor_id": "Pedro Castro",
        "turno_habitual": "Día",
        "estado": "Activo"
    }
],
    labores: [
    {
        "id":  "LAB01",
        "nombre":  "Empacadora",
        "estado":  "Activo"
    },
    {
        "id":  "LAB02",
        "nombre":  "Enzunchador",
        "estado":  "Activo"
    },
    {
        "id":  "LAB03",
        "nombre":  "Paletizado",
        "estado":  "Activo"
    },
    {
        "id":  "LAB04",
        "nombre":  "Armado de cajas",
        "estado":  "Activo"
    },
    {
        "id":  "LAB05",
        "nombre":  "Tapador",
        "estado":  "Activo"
    },
    {
        "id":  "LAB06",
        "nombre":  "Etiquetado",
        "estado":  "Activo"
    },
    {
        "id":  "LAB07",
        "nombre":  "Recepcion",
        "estado":  "Activo"
    }
],
    procesos: [
        { "id": "PRO01", "nombre": "RecepciÃƒÂ³n" },
        { "id": "PRO02", "nombre": "Calibrado" },
        { "id": "PRO03", "nombre": "Tratamiento HidrotÃƒÂ©rmico" },
        { "id": "PRO05", "nombre": "Empaque" }
    ],
    tipos_empaque: [
        {
            "id":  "EMP_MAR_EUR",
            "codigo":  "MAR_EUR",
            "nombre":  "Marítimo Europa",
            "tipo_transito":  "Marítimo",
            "destino":  "Europa",
            "estado":  "Activo"
        },
        {
            "id":  "EMP_MAR_USA",
            "codigo":  "MAR_USA",
            "nombre":  "Marítimo USA",
            "tipo_transito":  "Marítimo",
            "destino":  "USA",
            "estado":  "Activo"
        },
        {
            "id":  "EMP_MAR_CHL",
            "codigo":  "MAR_CHL",
            "nombre":  "Marítimo Chile",
            "tipo_transito":  "Marítimo",
            "destino":  "Chile",
            "estado":  "Activo"
        },
        {
            "id":  "EMP_MAR_JPN",
            "codigo":  "MAR_JPN",
            "nombre":  "Marítimo Japón",
            "tipo_transito":  "Marítimo",
            "destino":  "Japón",
            "estado":  "Activo"
        },
        {
            "id":  "EMP_MAR_CHN",
            "codigo":  "MAR_CHN",
            "nombre":  "Marítimo China",
            "tipo_transito":  "Marítimo",
            "destino":  "China",
            "estado":  "Activo"
        },
        {
            "id":  "EMP_AER_EUR",
            "codigo":  "AER_EUR",
            "nombre":  "Aéreo Europa",
            "tipo_transito":  "Aéreo",
            "destino":  "Europa",
            "estado":  "Activo"
        },
        {
            "id":  "EMP_AER_USA",
            "codigo":  "AER_USA",
            "nombre":  "Aéreo USA",
            "tipo_transito":  "Aéreo",
            "destino":  "USA",
            "estado":  "Activo"
        },
        {
            "id":  "EMP_AER_CHL",
            "codigo":  "AER_CHL",
            "nombre":  "Aéreo Chile",
            "tipo_transito":  "Aéreo",
            "destino":  "Chile",
            "estado":  "Activo"
        },
        {
            "id":  "EMP_AER_JPN",
            "codigo":  "AER_JPN",
            "nombre":  "Aéreo Japón",
            "tipo_transito":  "Aéreo",
            "destino":  "Japón",
            "estado":  "Activo"
        },
        {
            "id":  "EMP_AER_CHN",
            "codigo":  "AER_CHN",
            "nombre":  "Aéreo China",
            "tipo_transito":  "Aéreo",
            "destino":  "China",
            "estado":  "Activo"
        },
        {
            "id":  "EMP_AER_KOR",
            "codigo":  "AER_KOR",
            "nombre":  "Aéreo Corea",
            "tipo_transito":  "Aéreo",
            "destino":  "Corea",
            "estado":  "Activo"
        }
    ],
    tipos_caja: [
    {
        "id": "CAJ001",
        "codigo": "FONDO_NEGRO_TAPA_MARRON",
        "nombre": "FONDO NEGRO TAPA MARRON (4 KG)",
        "formato": "4 KG",
        "cant_pallet": 99,
        "tipo_empaque_via": "AER CHINA",
        "destino_pais": "CHINA",
        "requiere_hidrotermico": true,
        "requiere_maduracion": true,
        "base_pallet": 9,
        "peso_teorico": 4,
        "estado": "Activo"
    },
    {
        "id": "CAJ002",
        "codigo": "FONDO_NEGRO_TAPA_NEGRA",
        "nombre": "FONDO NEGRO TAPA  NEGRA (4 KG)",
        "formato": "4 KG",
        "cant_pallet": 99,
        "tipo_empaque_via": "AER CHINA",
        "destino_pais": "CHINA",
        "requiere_hidrotermico": true,
        "requiere_maduracion": true,
        "base_pallet": 9,
        "peso_teorico": 4,
        "estado": "Activo"
    },
    {
        "id": "CAJ003",
        "codigo": "GENERICA_MARRON_B12",
        "nombre": "GENERICA MARRON B12 (4 KG)",
        "formato": "4 KG",
        "cant_pallet": 156,
        "tipo_empaque_via": "AER CHINA",
        "destino_pais": "CHINA",
        "requiere_hidrotermico": true,
        "requiere_maduracion": true,
        "base_pallet": 12,
        "peso_teorico": 4,
        "estado": "Activo"
    },
    {
        "id": "CAJ004",
        "codigo": "FONDO_NEGRO_TAPA_YACUMAN",
        "nombre": "FONDO NEGRO TAPA YACUMAN (4 KG)",
        "formato": "4 KG",
        "cant_pallet": 99,
        "tipo_empaque_via": "AER CHINA",
        "destino_pais": "CHINA",
        "requiere_hidrotermico": true,
        "requiere_maduracion": true,
        "base_pallet": 9,
        "peso_teorico": 4,
        "estado": "Activo"
    },
    {
        "id": "CAJ005",
        "codigo": "FONDO_MARITIMO_TAPA_MARRON",
        "nombre": "FONDO MARITIMO TAPA MARRON (6 KG)",
        "formato": "6 KG",
        "cant_pallet": 88,
        "tipo_empaque_via": "AER CHINA",
        "destino_pais": "CHINA",
        "requiere_hidrotermico": true,
        "requiere_maduracion": true,
        "base_pallet": 8,
        "peso_teorico": 6,
        "estado": "Activo"
    },
    {
        "id": "CAJ006",
        "codigo": "FONDO_BLANCO_TAPA_MARRON",
        "nombre": "FONDO BLANCO TAPA MARRON (6 KG)",
        "formato": "6 KG",
        "cant_pallet": 88,
        "tipo_empaque_via": "AER CHINA",
        "destino_pais": "CHINA",
        "requiere_hidrotermico": true,
        "requiere_maduracion": true,
        "base_pallet": 8,
        "peso_teorico": 6,
        "estado": "Activo"
    },
    {
        "id": "CAJ007",
        "codigo": "FONDO_BLANCO_TAPA_NEGRA",
        "nombre": "FONDO BLANCO TAPA NEGRA (6 KG)",
        "formato": "6 KG",
        "cant_pallet": 88,
        "tipo_empaque_via": "AER CHINA",
        "destino_pais": "CHINA",
        "requiere_hidrotermico": true,
        "requiere_maduracion": true,
        "base_pallet": 8,
        "peso_teorico": 6,
        "estado": "Activo"
    },
    {
        "id": "CAJ008",
        "codigo": "CAJA_MIGROS",
        "nombre": "CAJA MIGROS (4 KG)",
        "formato": "4 KG",
        "cant_pallet": 99,
        "tipo_empaque_via": "AER EUR",
        "destino_pais": "EUR",
        "requiere_hidrotermico": false,
        "requiere_maduracion": true,
        "base_pallet": 9,
        "peso_teorico": 4,
        "estado": "Activo"
    },
    {
        "id": "CAJ009",
        "codigo": "FONDO_BLANCO_INT_NEGRO_TAPA_MARRON",
        "nombre": "FONDO BLANCO INT NEGRO  TAPA MARRON (6 KG)",
        "formato": "6 KG",
        "cant_pallet": 88,
        "tipo_empaque_via": "AER EUR",
        "destino_pais": "EUR",
        "requiere_hidrotermico": false,
        "requiere_maduracion": true,
        "base_pallet": 8,
        "peso_teorico": 6,
        "estado": "Activo"
    },
    {
        "id": "CAJ010",
        "codigo": "FONDO_BLANCO_INT_NEGRO_TAPA_NEGRA",
        "nombre": "FONDO BLANCO INT NEGRO  TAPA NEGRA (6 KG)",
        "formato": "6 KG",
        "cant_pallet": 88,
        "tipo_empaque_via": "AER EUR",
        "destino_pais": "EUR",
        "requiere_hidrotermico": false,
        "requiere_maduracion": true,
        "base_pallet": 8,
        "peso_teorico": 6,
        "estado": "Activo"
    },
    {
        "id": "CAJ011",
        "codigo": "FONDO_BLANCO_TAPA_MARRON",
        "nombre": "FONDO BLANCO TAPA MARRON (6 KG)",
        "formato": "6 KG",
        "cant_pallet": 88,
        "tipo_empaque_via": "AER EUR",
        "destino_pais": "EUR",
        "requiere_hidrotermico": false,
        "requiere_maduracion": true,
        "base_pallet": 8,
        "peso_teorico": 6,
        "estado": "Activo"
    },
    {
        "id": "CAJ012",
        "codigo": "FONDO_MARITIMO_TAPA_MARRON",
        "nombre": "FONDO MARITIMO TAPA MARRON (6 KG)",
        "formato": "6 KG",
        "cant_pallet": 88,
        "tipo_empaque_via": "AER EUR",
        "destino_pais": "EUR",
        "requiere_hidrotermico": false,
        "requiere_maduracion": true,
        "base_pallet": 8,
        "peso_teorico": 6,
        "estado": "Activo"
    },
    {
        "id": "CAJ013",
        "codigo": "FONDO_BLANCO_TAPA_NEGRA",
        "nombre": "FONDO BLANCO TAPA NEGRA (6 KG)",
        "formato": "6 KG",
        "cant_pallet": 88,
        "tipo_empaque_via": "AER EUR",
        "destino_pais": "EUR",
        "requiere_hidrotermico": false,
        "requiere_maduracion": true,
        "base_pallet": 8,
        "peso_teorico": 6,
        "estado": "Activo"
    },
    {
        "id": "CAJ014",
        "codigo": "FONDO_NEGRO_TAPA_NEGRA",
        "nombre": "FONDO NEGRO TAPA NEGRA (4 KG)",
        "formato": "4 KG",
        "cant_pallet": 99,
        "tipo_empaque_via": "AER EUR",
        "destino_pais": "EUR",
        "requiere_hidrotermico": false,
        "requiere_maduracion": true,
        "base_pallet": 9,
        "peso_teorico": 4,
        "estado": "Activo"
    },
    {
        "id": "CAJ015",
        "codigo": "FONDO_NEGRO_TAPA_NEGRA_B20",
        "nombre": "FONDO NEGRO TAPA NEGRA B20 (2.5 KG)",
        "formato": "2.5 KG",
        "cant_pallet": 280,
        "tipo_empaque_via": "AER EUR",
        "destino_pais": "EUR",
        "requiere_hidrotermico": false,
        "requiere_maduracion": true,
        "base_pallet": 20,
        "peso_teorico": 2.5,
        "estado": "Activo"
    },
    {
        "id": "CAJ016",
        "codigo": "GENERICA_NEGRA_B12",
        "nombre": "GENERICA NEGRA B12 (4 KG)",
        "formato": "4 KG",
        "cant_pallet": 156,
        "tipo_empaque_via": "AER EUR",
        "destino_pais": "EUR",
        "requiere_hidrotermico": false,
        "requiere_maduracion": true,
        "base_pallet": 12,
        "peso_teorico": 4,
        "estado": "Activo"
    },
    {
        "id": "CAJ017",
        "codigo": "FONDO_NEGRO_TAPA_NEGRA",
        "nombre": "FONDO NEGRO TAPA  NEGRA (4 KG)",
        "formato": "4 KG",
        "cant_pallet": 99,
        "tipo_empaque_via": "AER COR",
        "destino_pais": "COREA",
        "requiere_hidrotermico": true,
        "requiere_maduracion": true,
        "base_pallet": 9,
        "peso_teorico": 4,
        "estado": "Activo"
    },
    {
        "id": "CAJ018",
        "codigo": "FONDO_NEGRO_TAPA_MARRON",
        "nombre": "FONDO NEGRO TAPA MARRON (4 KG)",
        "formato": "4 KG",
        "cant_pallet": 99,
        "tipo_empaque_via": "AER COR",
        "destino_pais": "COREA",
        "requiere_hidrotermico": true,
        "requiere_maduracion": true,
        "base_pallet": 9,
        "peso_teorico": 4,
        "estado": "Activo"
    },
    {
        "id": "CAJ019",
        "codigo": "FONDO_NEGRO_TAPA_ALLPA",
        "nombre": "FONDO NEGRO TAPA ALLPA (4 KG)",
        "formato": "4 KG",
        "cant_pallet": 99,
        "tipo_empaque_via": "AER COR",
        "destino_pais": "COREA",
        "requiere_hidrotermico": true,
        "requiere_maduracion": true,
        "base_pallet": 9,
        "peso_teorico": 4,
        "estado": "Activo"
    },
    {
        "id": "CAJ020",
        "codigo": "FONDO_NEGRO_TAPA_KILLA",
        "nombre": "FONDO NEGRO TAPA KILLA (4 KG)",
        "formato": "4 KG",
        "cant_pallet": 99,
        "tipo_empaque_via": "AER COR",
        "destino_pais": "COREA",
        "requiere_hidrotermico": true,
        "requiere_maduracion": true,
        "base_pallet": 9,
        "peso_teorico": 4,
        "estado": "Activo"
    },
    {
        "id": "CAJ021",
        "codigo": "FONDO_BLANCO_TAPA_NEGRA",
        "nombre": "FONDO BLANCO TAPA NEGRA (6 KG)",
        "formato": "6 KG",
        "cant_pallet": 88,
        "tipo_empaque_via": "AER COR",
        "destino_pais": "COREA",
        "requiere_hidrotermico": true,
        "requiere_maduracion": true,
        "base_pallet": 8,
        "peso_teorico": 6,
        "estado": "Activo"
    },
    {
        "id": "CAJ022",
        "codigo": "FONDO_NEGRO_TAPA_INTI_SELECTION",
        "nombre": "FONDO NEGRO TAPA INTI SELECTION (4 KG)",
        "formato": "4 KG",
        "cant_pallet": 99,
        "tipo_empaque_via": "AER COR",
        "destino_pais": "COREA",
        "requiere_hidrotermico": true,
        "requiere_maduracion": true,
        "base_pallet": 9,
        "peso_teorico": 4,
        "estado": "Activo"
    },
    {
        "id": "CAJ023",
        "codigo": "FONDO_NEGRO_TAPA_YACUMAN",
        "nombre": "FONDO NEGRO TAPA YACUMAN (4 KG)",
        "formato": "4 KG",
        "cant_pallet": 99,
        "tipo_empaque_via": "AER COR",
        "destino_pais": "COREA",
        "requiere_hidrotermico": true,
        "requiere_maduracion": true,
        "base_pallet": 9,
        "peso_teorico": 4,
        "estado": "Activo"
    },
    {
        "id": "CAJ024",
        "codigo": "GENERICA_MARRON_B12",
        "nombre": "GENERICA MARRON B12 (4 KG)",
        "formato": "4 KG",
        "cant_pallet": 132,
        "tipo_empaque_via": "MAR CHINA",
        "destino_pais": "CHINA",
        "requiere_hidrotermico": true,
        "requiere_maduracion": false,
        "base_pallet": 12,
        "peso_teorico": 4,
        "estado": "Activo"
    },
    {
        "id": "CAJ025",
        "codigo": "CAJA_KRAFT_PITUFA",
        "nombre": "CAJA KRAFT PITUFA (2.5 KG)",
        "formato": "2.5 KG",
        "cant_pallet": 360,
        "tipo_empaque_via": "MAR EUR",
        "destino_pais": "EUR",
        "requiere_hidrotermico": false,
        "requiere_maduracion": false,
        "base_pallet": 40,
        "peso_teorico": 2.5,
        "estado": "Activo"
    },
    {
        "id": "CAJ026",
        "codigo": "CAJA_VERDE_B5",
        "nombre": "CAJA VERDE B5 (10 KG)",
        "formato": "10 KG",
        "cant_pallet": 105,
        "tipo_empaque_via": "MAR EUR",
        "destino_pais": "EUR",
        "requiere_hidrotermico": false,
        "requiere_maduracion": false,
        "base_pallet": 5,
        "peso_teorico": 10,
        "estado": "Activo"
    },
    {
        "id": "CAJ027",
        "codigo": "GENERICA_NEGRA_B12",
        "nombre": "GENERICA NEGRA B12 (4 KG)",
        "formato": "4 KG",
        "cant_pallet": 252,
        "tipo_empaque_via": "MAR EUR",
        "destino_pais": "EUR",
        "requiere_hidrotermico": false,
        "requiere_maduracion": false,
        "base_pallet": 12,
        "peso_teorico": 4,
        "estado": "Activo"
    },
    {
        "id": "CAJ028",
        "codigo": "CAJA_MIGROS",
        "nombre": "CAJA MIGROS (4 KG)",
        "formato": "4 KG",
        "cant_pallet": 135,
        "tipo_empaque_via": "MAR EUR",
        "destino_pais": "EUR",
        "requiere_hidrotermico": false,
        "requiere_maduracion": false,
        "base_pallet": 9,
        "peso_teorico": 4,
        "estado": "Activo"
    },
    {
        "id": "CAJ029",
        "codigo": "CAJA_KRAFT_MADERA",
        "nombre": "CAJA KRAFT MADERA (4 KG)",
        "formato": "4 KG",
        "cant_pallet": 252,
        "tipo_empaque_via": "MAR EUR",
        "destino_pais": "EUR",
        "requiere_hidrotermico": false,
        "requiere_maduracion": false,
        "base_pallet": 12,
        "peso_teorico": 4,
        "estado": "Activo"
    },
    {
        "id": "CAJ030",
        "codigo": "CAJA_WISHA_B12",
        "nombre": "CAJA WISHA B12 (4 KG)",
        "formato": "4 KG",
        "cant_pallet": 252,
        "tipo_empaque_via": "MAR EUR",
        "destino_pais": "EUR",
        "requiere_hidrotermico": false,
        "requiere_maduracion": false,
        "base_pallet": 12,
        "peso_teorico": 4,
        "estado": "Activo"
    },
    {
        "id": "CAJ031",
        "codigo": "GENERICA_MARRON_B12",
        "nombre": "GENERICA MARRON B12 (4 KG)",
        "formato": "4 KG",
        "cant_pallet": 252,
        "tipo_empaque_via": "MAR EUR",
        "destino_pais": "EUR",
        "requiere_hidrotermico": false,
        "requiere_maduracion": false,
        "base_pallet": 12,
        "peso_teorico": 4,
        "estado": "Activo"
    },
    {
        "id": "CAJ032",
        "codigo": "CAJA_MARRON_11_KG",
        "nombre": "CAJA MARRON 11 KG (11 KG)",
        "formato": "11 KG",
        "cant_pallet": 95,
        "tipo_empaque_via": "MAR EUR",
        "destino_pais": "EUR",
        "requiere_hidrotermico": false,
        "requiere_maduracion": false,
        "base_pallet": 5,
        "peso_teorico": 11,
        "estado": "Activo"
    },
    {
        "id": "CAJ033",
        "codigo": "CAJA_NEGRA_PREMIUM",
        "nombre": "CAJA NEGRA PREMIUM (4 KG)",
        "formato": "4 KG",
        "cant_pallet": 252,
        "tipo_empaque_via": "MAR EUR",
        "destino_pais": "EUR",
        "requiere_hidrotermico": false,
        "requiere_maduracion": false,
        "base_pallet": 12,
        "peso_teorico": 4,
        "estado": "Activo"
    },
    {
        "id": "CAJ034",
        "codigo": "CAJA_KRAFT_ORGANICO",
        "nombre": "CAJA KRAFT ORGANICO (4 KG)",
        "formato": "4 KG",
        "cant_pallet": 252,
        "tipo_empaque_via": "MAR EUR",
        "destino_pais": "EUR",
        "requiere_hidrotermico": false,
        "requiere_maduracion": false,
        "base_pallet": 12,
        "peso_teorico": 4,
        "estado": "Activo"
    },
    {
        "id": "CAJ035",
        "codigo": "CAJA_KRAFT_PITUFA_ORGANICA",
        "nombre": "CAJA KRAFT PITUFA ORGANICA (2.5 KG)",
        "formato": "2.5 KG",
        "cant_pallet": 360,
        "tipo_empaque_via": "MAR EUR",
        "destino_pais": "EUR",
        "requiere_hidrotermico": false,
        "requiere_maduracion": false,
        "base_pallet": 40,
        "peso_teorico": 2.5,
        "estado": "Activo"
    },
    {
        "id": "CAJ036",
        "codigo": "CAJA_KRAFT_PITUFA",
        "nombre": "CAJA KRAFT PITUFA (2.5 KG)",
        "formato": "2.5 KG",
        "cant_pallet": 360,
        "tipo_empaque_via": "MAR USA",
        "destino_pais": "USA",
        "requiere_hidrotermico": true,
        "requiere_maduracion": false,
        "base_pallet": 40,
        "peso_teorico": 2.5,
        "estado": "Activo"
    },
    {
        "id": "CAJ037",
        "codigo": "CAJA_KRAFT_PITUFA_ORGANICA",
        "nombre": "CAJA KRAFT PITUFA ORGANICA (2.5 KG)",
        "formato": "2.5 KG",
        "cant_pallet": 360,
        "tipo_empaque_via": "MAR USA",
        "destino_pais": "USA",
        "requiere_hidrotermico": true,
        "requiere_maduracion": false,
        "base_pallet": 40,
        "peso_teorico": 2.5,
        "estado": "Activo"
    },
    {
        "id": "CAJ038",
        "codigo": "CAJA_MISSION_PITUFA",
        "nombre": "CAJA MISSION PITUFA (2.5 KG)",
        "formato": "2.5 KG",
        "cant_pallet": 360,
        "tipo_empaque_via": "MAR USA",
        "destino_pais": "USA",
        "requiere_hidrotermico": true,
        "requiere_maduracion": false,
        "base_pallet": 40,
        "peso_teorico": 2.5,
        "estado": "Activo"
    },
    {
        "id": "CAJ039",
        "codigo": "CAJA_KRAFT_MASTER",
        "nombre": "CAJA KRAFT MASTER (20 KG)",
        "formato": "20 KG",
        "cant_pallet": 45,
        "tipo_empaque_via": "MAR EUR",
        "destino_pais": "EUR",
        "requiere_hidrotermico": false,
        "requiere_maduracion": false,
        "base_pallet": 5,
        "peso_teorico": 20,
        "estado": "Activo"
    },
    {
        "id": "CAJ040",
        "codigo": "CAJA_MISSION_MASTER",
        "nombre": "CAJA MISSION MASTER (20 KG)",
        "formato": "20 KG",
        "cant_pallet": 45,
        "tipo_empaque_via": "MAR USA",
        "destino_pais": "USA",
        "requiere_hidrotermico": true,
        "requiere_maduracion": false,
        "base_pallet": 5,
        "peso_teorico": 20,
        "estado": "Activo"
    },
    {
        "id": "CAJ041",
        "codigo": "CAJA_KRAFT_MASTER",
        "nombre": "CAJA KRAFT MASTER (20 KG)",
        "formato": "20 KG",
        "cant_pallet": 45,
        "tipo_empaque_via": "MAR USA",
        "destino_pais": "USA",
        "requiere_hidrotermico": true,
        "requiere_maduracion": false,
        "base_pallet": 5,
        "peso_teorico": 20,
        "estado": "Activo"
    },
    {
        "id": "CAJ042",
        "codigo": "FONDO_BLANCO_TAPA_MARRON",
        "nombre": "FONDO BLANCO TAPA MARRON (6 KG)",
        "formato": "6 KG",
        "cant_pallet": 88,
        "tipo_empaque_via": "AER USA",
        "destino_pais": "USA",
        "requiere_hidrotermico": true,
        "requiere_maduracion": true,
        "base_pallet": 8,
        "peso_teorico": 6,
        "estado": "Activo"
    },
    {
        "id": "CAJ043",
        "codigo": "FONDO_BLANCO_TAPA_NEGRA",
        "nombre": "FONDO BLANCO TAPA NEGRA (6 KG)",
        "formato": "6 KG",
        "cant_pallet": 88,
        "tipo_empaque_via": "AER USA",
        "destino_pais": "USA",
        "requiere_hidrotermico": true,
        "requiere_maduracion": true,
        "base_pallet": 8,
        "peso_teorico": 6,
        "estado": "Activo"
    },
    {
        "id": "CAJ044",
        "codigo": "GENERICA_NEGRA_B12",
        "nombre": "GENERICA NEGRA B12 (4 KG)",
        "formato": "4 KG",
        "cant_pallet": 252,
        "tipo_empaque_via": "MAR USA",
        "destino_pais": "USA",
        "requiere_hidrotermico": true,
        "requiere_maduracion": false,
        "base_pallet": 12,
        "peso_teorico": 4,
        "estado": "Activo"
    },
    {
        "id": "CAJ045",
        "codigo": "MISSION_NARANJA_B14",
        "nombre": "MISSION NARANJA B14 (4 KG)",
        "formato": "4 KG",
        "cant_pallet": 280,
        "tipo_empaque_via": "MAR USA",
        "destino_pais": "USA",
        "requiere_hidrotermico": true,
        "requiere_maduracion": false,
        "base_pallet": 14,
        "peso_teorico": 4,
        "estado": "Activo"
    },
    {
        "id": "CAJ046",
        "codigo": "CAJA_KRAFT_MADERA",
        "nombre": "CAJA KRAFT MADERA (4 KG)",
        "formato": "4 KG",
        "cant_pallet": 252,
        "tipo_empaque_via": "MAR USA",
        "destino_pais": "USA",
        "requiere_hidrotermico": true,
        "requiere_maduracion": false,
        "base_pallet": 12,
        "peso_teorico": 4,
        "estado": "Activo"
    },
    {
        "id": "CAJ047",
        "codigo": "GENERICA_MARRON_B12_3.75_KG",
        "nombre": "GENERICA MARRON  B12 3.75 KG (4 KG)",
        "formato": "4 KG",
        "cant_pallet": 252,
        "tipo_empaque_via": "MAR USA",
        "destino_pais": "USA",
        "requiere_hidrotermico": true,
        "requiere_maduracion": false,
        "base_pallet": 12,
        "peso_teorico": 4,
        "estado": "Activo"
    },
    {
        "id": "CAJ048",
        "codigo": "GENERICA_MARRON_B12",
        "nombre": "GENERICA MARRON B12 (4 KG)",
        "formato": "4 KG",
        "cant_pallet": 252,
        "tipo_empaque_via": "MAR USA",
        "destino_pais": "USA",
        "requiere_hidrotermico": true,
        "requiere_maduracion": false,
        "base_pallet": 12,
        "peso_teorico": 4,
        "estado": "Activo"
    },
    {
        "id": "CAJ049",
        "codigo": "GENERICA_MARRON_B15_3.75_KG",
        "nombre": "GENERICA MARRON  B15 3.75 KG (4 KG)",
        "formato": "4 KG",
        "cant_pallet": 255,
        "tipo_empaque_via": "MAR USA",
        "destino_pais": "USA",
        "requiere_hidrotermico": true,
        "requiere_maduracion": false,
        "base_pallet": 15,
        "peso_teorico": 4,
        "estado": "Activo"
    },
    {
        "id": "CAJ050",
        "codigo": "GENERICA_MARRON_B12",
        "nombre": "GENERICA MARRON B12 (4 KG)",
        "formato": "4 KG",
        "cant_pallet": 252,
        "tipo_empaque_via": "MAR CHILE",
        "destino_pais": "CHILE",
        "requiere_hidrotermico": true,
        "requiere_maduracion": true,
        "base_pallet": 12,
        "peso_teorico": 4,
        "estado": "Activo"
    },
    {
        "id": "CAJ_50",
        "codigo": "CAJA_GENÉRICA",
        "nombre": "Caja Genérica (4 KG)",
        "formato": "4 KG",
        "cant_pallet": 99,
        "tipo_empaque_via": "AEREO",
        "destino_pais": "VARIOS",
        "requiere_hidrotermico": false,
        "requiere_maduracion": false,
        "base_pallet": 9,
        "peso_teorico": 4,
        "estado": "Activo"
    },
    {
        "id": "CAJ_51",
        "codigo": "CAJA_GENÉRICA",
        "nombre": "Caja Genérica (4 KG)",
        "formato": "4 KG",
        "cant_pallet": 99,
        "tipo_empaque_via": "AEREO",
        "destino_pais": "VARIOS",
        "requiere_hidrotermico": false,
        "requiere_maduracion": false,
        "base_pallet": 9,
        "peso_teorico": 4,
        "estado": "Activo"
    }
],
    coeficientes_costeo: [
    {
        "exportador":  "PACHAMAMA",
        "via":  "MARITIMO",
        "empaque":  "EUROPA",
        "caja":  "OGL",
        "kg":  "4",
        "ctn":  5544,
        "horas_ctn":  3
    },
    {
        "exportador":  "PACHAMAMA",
        "via":  "MARITIMO",
        "empaque":  "EUROPA",
        "caja":  "NEGRA",
        "kg":  "4",
        "ctn":  5544,
        "horas_ctn":  2.7
    },
    {
        "exportador":  "PACHAMAMA",
        "via":  "MARITIMO",
        "empaque":  "EUROPA",
        "caja":  "PREMIUM",
        "kg":  "4",
        "ctn":  5544,
        "horas_ctn":  2.7
    },
    {
        "exportador":  "PACHAMAMA",
        "via":  "MARITIMO",
        "empaque":  "EUROPA",
        "caja":  "WISHA",
        "kg":  "4",
        "ctn":  5544,
        "horas_ctn":  3
    },
    {
        "exportador":  "PACHAMAMA",
        "via":  "MARITIMO",
        "empaque":  "EUROPA",
        "caja":  "MIGROS",
        "kg":  "4",
        "ctn":  5544,
        "horas_ctn":  3
    },
    {
        "exportador":  "PACHAMAMA",
        "via":  "MARITIMO",
        "empaque":  "EUROPA",
        "caja":  "MISSION",
        "kg":  "4",
        "ctn":  5544,
        "horas_ctn":  2.7
    },
    {
        "exportador":  "PACHAMAMA",
        "via":  "MARITIMO",
        "empaque":  "EUROPA",
        "caja":  "PMM",
        "kg":  "4",
        "ctn":  5544,
        "horas_ctn":  2.7
    },
    {
        "exportador":  "PACHAMAMA",
        "via":  "MARITIMO",
        "empaque":  "EUROPA",
        "caja":  "P ORGANICO",
        "kg":  "4",
        "ctn":  5544,
        "horas_ctn":  3
    },
    {
        "exportador":  "PACHAMAMA",
        "via":  "MARITIMO",
        "empaque":  "EUROPA",
        "caja":  "VERDE",
        "kg":  "10",
        "ctn":  2100,
        "horas_ctn":  2.5
    },
    {
        "exportador":  "PACHAMAMA",
        "via":  "MARITIMO",
        "empaque":  "EUROPA",
        "caja":  "PMM",
        "kg":  "10",
        "ctn":  2100,
        "horas_ctn":  2.5
    },
    {
        "exportador":  "PACHAMAMA",
        "via":  "MARITIMO",
        "empaque":  "EUROPA",
        "caja":  "PITUFA",
        "kg":  "2.5",
        "ctn":  7200,
        "horas_ctn":  4
    },
    {
        "exportador":  "PACHAMAMA",
        "via":  "MARITIMO",
        "empaque":  "EUROPA",
        "caja":  "ORGANICA",
        "kg":  "2",
        "ctn":  7200,
        "horas_ctn":  4
    },
    {
        "exportador":  "PACHAMAMA",
        "via":  "MARITIMO",
        "empaque":  "USA",
        "caja":  "P .ORGÁNICO",
        "kg":  "",
        "ctn":  0,
        "horas_ctn":  0
    },
    {
        "exportador":  "PACHAMAMA",
        "via":  "MARITIMO",
        "empaque":  "USA",
        "caja":  "MISSION",
        "kg":  "",
        "ctn":  0,
        "horas_ctn":  0
    },
    {
        "exportador":  "PACHAMAMA",
        "via":  "MARITIMO",
        "empaque":  "USA",
        "caja":  "MISSION B14",
        "kg":  "",
        "ctn":  0,
        "horas_ctn":  0
    },
    {
        "exportador":  "PACHAMAMA",
        "via":  "MARITIMO",
        "empaque":  "USA",
        "caja":  "OGL",
        "kg":  "",
        "ctn":  0,
        "horas_ctn":  0
    },
    {
        "exportador":  "PACHAMAMA",
        "via":  "MARITIMO",
        "empaque":  "USA",
        "caja":  "CAJA NEGRA",
        "kg":  "",
        "ctn":  0,
        "horas_ctn":  0
    },
    {
        "exportador":  "PACHAMAMA",
        "via":  "MARITIMO",
        "empaque":  "USA",
        "caja":  "P-B12",
        "kg":  "",
        "ctn":  0,
        "horas_ctn":  0
    },
    {
        "exportador":  "PACHAMAMA",
        "via":  "MARITIMO",
        "empaque":  "USA",
        "caja":  "P-B15",
        "kg":  "",
        "ctn":  0,
        "horas_ctn":  0
    },
    {
        "exportador":  "PACHAMAMA",
        "via":  "MARITIMO",
        "empaque":  "USA",
        "caja":  "P-MARRON",
        "kg":  "",
        "ctn":  0,
        "horas_ctn":  0
    },
    {
        "exportador":  "PACHAMAMA",
        "via":  "MARITIMO",
        "empaque":  "USA",
        "caja":  "P MARRON",
        "kg":  "",
        "ctn":  0,
        "horas_ctn":  0
    },
    {
        "exportador":  "PACHAMAMA",
        "via":  "MARITIMO",
        "empaque":  "USA",
        "caja":  "P-12",
        "kg":  "",
        "ctn":  0,
        "horas_ctn":  0
    },
    {
        "exportador":  "PACHAMAMA",
        "via":  "MARITIMO",
        "empaque":  "USA",
        "caja":  "P MARRON",
        "kg":  "",
        "ctn":  0,
        "horas_ctn":  0
    },
    {
        "exportador":  "PACHAMAMA",
        "via":  "",
        "empaque":  "",
        "caja":  "P-12",
        "kg":  "",
        "ctn":  0,
        "horas_ctn":  0
    },
    {
        "exportador":  "PACHAMAMA",
        "via":  "",
        "empaque":  "",
        "caja":  "",
        "kg":  "",
        "ctn":  0,
        "horas_ctn":  0
    },
    {
        "exportador":  "PACHAMAMA",
        "via":  "",
        "empaque":  "",
        "caja":  "",
        "kg":  "",
        "ctn":  0,
        "horas_ctn":  0
    },
    {
        "exportador":  "PACHAMAMA",
        "via":  "",
        "empaque":  "",
        "caja":  "",
        "kg":  "",
        "ctn":  0,
        "horas_ctn":  0
    },
    {
        "exportador":  "PACHAMAMA",
        "via":  "",
        "empaque":  "",
        "caja":  "",
        "kg":  "",
        "ctn":  0,
        "horas_ctn":  0
    },
    {
        "exportador":  "PACHAMAMA",
        "via":  "",
        "empaque":  "",
        "caja":  "",
        "kg":  "",
        "ctn":  0,
        "horas_ctn":  0
    },
    {
        "exportador":  "PACHAMAMA",
        "via":  "",
        "empaque":  "",
        "caja":  "",
        "kg":  "",
        "ctn":  0,
        "horas_ctn":  0
    },
    {
        "exportador":  "PACHAMAMA",
        "via":  "",
        "empaque":  "",
        "caja":  "",
        "kg":  "",
        "ctn":  0,
        "horas_ctn":  0
    },
    {
        "exportador":  "PACHAMAMA",
        "via":  "",
        "empaque":  "",
        "caja":  "",
        "kg":  "",
        "ctn":  0,
        "horas_ctn":  0
    },
    {
        "exportador":  "PACHAMAMA",
        "via":  "",
        "empaque":  "",
        "caja":  "",
        "kg":  "",
        "ctn":  0,
        "horas_ctn":  0
    },
    {
        "exportador":  "PACHAMAMA",
        "via":  "",
        "empaque":  "",
        "caja":  "",
        "kg":  "",
        "ctn":  0,
        "horas_ctn":  0
    },
    {
        "exportador":  "PACHAMAMA",
        "via":  "",
        "empaque":  "",
        "caja":  "",
        "kg":  "",
        "ctn":  0,
        "horas_ctn":  0
    },
    {
        "exportador":  "PACHAMAMA",
        "via":  "",
        "empaque":  "",
        "caja":  "",
        "kg":  "",
        "ctn":  0,
        "horas_ctn":  0
    },
    {
        "exportador":  "PACHAMAMA",
        "via":  "",
        "empaque":  "",
        "caja":  "",
        "kg":  "",
        "ctn":  0,
        "horas_ctn":  0
    },
    {
        "exportador":  "PACHAMAMA",
        "via":  "",
        "empaque":  "",
        "caja":  "",
        "kg":  "",
        "ctn":  0,
        "horas_ctn":  0
    },
    {
        "exportador":  "PACHAMAMA",
        "via":  "",
        "empaque":  "",
        "caja":  "",
        "kg":  "",
        "ctn":  0,
        "horas_ctn":  0
    },
    {
        "exportador":  "PACHAMAMA",
        "via":  "",
        "empaque":  "",
        "caja":  "",
        "kg":  "",
        "ctn":  0,
        "horas_ctn":  0
    },
    {
        "exportador":  "PACHAMAMA",
        "via":  "",
        "empaque":  "",
        "caja":  "",
        "kg":  "",
        "ctn":  0,
        "horas_ctn":  0
    },
    {
        "exportador":  "PACHAMAMA",
        "via":  "",
        "empaque":  "",
        "caja":  "",
        "kg":  "",
        "ctn":  0,
        "horas_ctn":  0
    },
    {
        "exportador":  "PACHAMAMA",
        "via":  "",
        "empaque":  "",
        "caja":  "",
        "kg":  "",
        "ctn":  0,
        "horas_ctn":  0
    },
    {
        "exportador":  "PACHAMAMA",
        "via":  "",
        "empaque":  "",
        "caja":  "",
        "kg":  "",
        "ctn":  0,
        "horas_ctn":  0
    },
    {
        "exportador":  "PACHAMAMA",
        "via":  "",
        "empaque":  "",
        "caja":  "",
        "kg":  "",
        "ctn":  0,
        "horas_ctn":  0
    },
    {
        "exportador":  "PACHAMAMA",
        "via":  "",
        "empaque":  "",
        "caja":  "",
        "kg":  "",
        "ctn":  0,
        "horas_ctn":  0
    },
    {
        "exportador":  "PACHAMAMA",
        "via":  "",
        "empaque":  "",
        "caja":  "",
        "kg":  "",
        "ctn":  0,
        "horas_ctn":  0
    }
],
    motivos_parada: [
    {
        "id":  "MOT01",
        "nombre":  "Falta fruta",
        "estado":  "Activo"
    },
    {
        "id":  "MOT02",
        "nombre":  "Cambio lote",
        "estado":  "Activo"
    },
    {
        "id":  "MOT03",
        "nombre":  "Limpieza",
        "estado":  "Activo"
    },
    {
        "id":  "MOT04",
        "nombre":  "Mantenimiento",
        "estado":  "Activo"
    },
    {
        "id":  "MOT05",
        "nombre":  "Descanso",
        "estado":  "Activo"
    },
    {
        "id":  "MOT06",
        "nombre":  "Espera",
        "estado":  "Activo"
    },
    {
        "id":  "MOT07",
        "nombre":  "Otro",
        "estado":  "Activo"
    }
],
    turnos: [
    {
        "id":  "TRN01",
        "nombre":  "Turno Dia",
        "hora_inicio":  "08:30",
        "hora_fin":  "17:00",
        "cruza_medianoche":  false,
        "aplica_bono":  false,
        "horas_normales":  8,
        "horas_extras":  0.5
    },
    {
        "id":  "TRN02",
        "nombre":  "Turno Noche",
        "hora_inicio":  "18:30",
        "hora_fin":  "08:00",
        "cruza_medianoche":  true,
        "aplica_bono":  true,
        "horas_normales":  8,
        "horas_extras":  5.5
    }
],
    personal: [
    {
        "id":  "PER01",
        "codigo":  "T001",
        "dni":  "70451234",
        "nombre":  "Juan",
        "apellidos":  "Perez Castro",
        "sexo":  "M",
        "fecha_ingreso":  "2025-11-01",
        "supervisor_id":  "SUP01",
        "grupo_id":  "GRP01",
        "labor_id":  "LAB07",
        "tipo_contrato":  "Temporal",
        "costo_hora_normal":  10.00,
        "costo_hora_extra":  15.00,
        "bono_nocturno":  2.50,
        "moneda":  "PEN",
        "estado":  "Activo",
        "observaciones":  "Recepcion"
    },
    {
        "id":  "PER02",
        "codigo":  "T002",
        "dni":  "45871239",
        "nombre":  "Maria",
        "apellidos":  "Flores Rivas",
        "sexo":  "F",
        "fecha_ingreso":  "2025-11-03",
        "supervisor_id":  "SUP04",
        "grupo_id":  "GRP04",
        "labor_id":  "LAB01",
        "tipo_contrato":  "Temporal",
        "costo_hora_normal":  12.00,
        "costo_hora_extra":  18.00,
        "bono_nocturno":  3.00,
        "moneda":  "PEN",
        "estado":  "Activo",
        "observaciones":  "Empacadora"
    },
    {
        "id":  "PER03",
        "codigo":  "T003",
        "dni":  "47223948",
        "nombre":  "Jose",
        "apellidos":  "Huaman Flores",
        "sexo":  "M",
        "fecha_ingreso":  "2025-11-05",
        "supervisor_id":  "SUP05",
        "grupo_id":  "GRP05",
        "labor_id":  "LAB01",
        "tipo_contrato":  "Temporal",
        "costo_hora_normal":  11.00,
        "costo_hora_extra":  16.50,
        "bono_nocturno":  2.75,
        "moneda":  "PEN",
        "estado":  "Activo",
        "observaciones":  "Empacador"
    }
],
    programa_exportacion: [],
    produccion_diaria: [],
    asistencia_diaria: [],
    tareo_diario: [],
    trazabilidad_lotes: [],
    recepcion_mp: [],
    calibrado_mp: []
};

class IndexedDBHelper {
    constructor(dbName, storeNames) {
        this.dbName = dbName;
        this.storeNames = storeNames;
        this.db = null;
    }

    open() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 6); // Version 6 to force upgrade/reseed!
            request.onerror = (e) => reject(e.target.error);
            request.onsuccess = (e) => {
                this.db = e.target.result;
                resolve(this.db);
            };
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                this.storeNames.forEach(storeName => {
                    if (!db.objectStoreNames.contains(storeName)) {
                        db.createObjectStore(storeName, { keyPath: "id" });
                    }
                });
            };
        });
    }

    getAll(storeName) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                resolve([]);
                return;
            }
            try {
                const tx = this.db.transaction(storeName, "readonly");
                const store = tx.objectStore(storeName);
                const request = store.getAll();
                request.onsuccess = () => resolve(request.result || []);
                request.onerror = () => reject(request.error);
            } catch (e) {
                reject(e);
            }
        });
    }

    put(storeName, data) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                resolve();
                return;
            }
            try {
                const tx = this.db.transaction(storeName, "readwrite");
                const store = tx.objectStore(storeName);
                const request = store.put(data);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            } catch (e) {
                reject(e);
            }
        });
    }

    putMany(storeName, items) {
        return new Promise((resolve, reject) => {
            if (!this.db || items.length === 0) {
                resolve();
                return;
            }
            try {
                const tx = this.db.transaction(storeName, "readwrite");
                const store = tx.objectStore(storeName);
                items.forEach(item => {
                    store.put(item);
                });
                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error);
            } catch (e) {
                reject(e);
            }
        });
    }

    delete(storeName, id) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                resolve();
                return;
            }
            try {
                const tx = this.db.transaction(storeName, "readwrite");
                const store = tx.objectStore(storeName);
                const request = store.delete(id);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            } catch (e) {
                reject(e);
            }
        });
    }

    deleteMany(storeName, ids) {
        return new Promise((resolve, reject) => {
            if (!this.db || ids.length === 0) {
                resolve();
                return;
            }
            try {
                const tx = this.db.transaction(storeName, "readwrite");
                const store = tx.objectStore(storeName);
                ids.forEach(id => {
                    store.delete(id);
                });
                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error);
            } catch (e) {
                reject(e);
            }
        });
    }

    clear(storeName) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                resolve();
                return;
            }
            try {
                const tx = this.db.transaction(storeName, "readwrite");
                const store = tx.objectStore(storeName);
                const request = store.clear();
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            } catch (e) {
                reject(e);
            }
        });
    }
}

class Database {
    constructor() {
        this.cache = {};
        this.firestore = null;
        this.listeners = [];
        this.idb = null;
        this.storeNames = [
            'empresas', 'clientes', 'proveedores_mp', 'supervisores', 'labores', 'variedades', 'productos',
            'turnos', 'grupos', 'tipos_caja', 'tipos_empaque', 'programa_exportacion',
            'personal', 'recepcion_mp', 'calibrado_mp', 'produccion_diaria',
            'asistencia_diaria', 'tareo_diario', 'procesos', 'coeficientes_costeo'
        ];
    }

    generateId(key) {
        const prefix = key.substring(0, 3).toUpperCase();
        let randomPart = '';
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
            randomPart = crypto.randomUUID().replace(/-/g, '').substring(0, 12).toUpperCase();
        } else {
            randomPart = Math.random().toString(36).substring(2, 14).toUpperCase();
        }
        return `${prefix}_${randomPart}`;
    }

    init() {
        this.load().catch(err => console.error("Database compatibility init error:", err));
    }

    async load() {
        // Initialize IndexedDB
        this.idb = new IndexedDBHelper("pachamama_erp_db", this.storeNames);
        await this.idb.open();

        // 1. Upgrade check (same version logic as before)
        const versionKey = STORAGE_PREFIX + 'db_version';
        const storedVersion = localStorage.getItem(versionKey);
        
        if (storedVersion !== DB_VERSION) {
            localStorage.clear();
            localStorage.setItem(versionKey, DB_VERSION);
            for (let store of this.storeNames) {
                await this.idb.clear(store).catch(e => console.error("IDB clear error:", e));
            }
            console.log("Local Database cleared to upgrade database seeds to version " + DB_VERSION);
        }

        // 2. Migration and Seeding
        for (let key of this.storeNames) {
            const storageKey = STORAGE_PREFIX + key;
            const localData = localStorage.getItem(storageKey);
            
            // Check if there is data in localStorage to migrate
            if (localData) {
                try {
                    const parsed = JSON.parse(localData);
                    if (Array.isArray(parsed)) {
                        for (let item of parsed) {
                            if (!item.id) {
                                item.id = this.generateId(key);
                            }
                            await this.idb.put(key, item);
                        }
                    }
                    localStorage.removeItem(storageKey);
                    console.log(`Migrated ${key} from localStorage to IndexedDB.`);
                } catch (e) {
                    console.error(`Migration error for key ${key}:`, e);
                }
            }

            // Read from IndexedDB into memory cache
            let cachedList = await this.idb.getAll(key);
            
            // If IndexedDB is empty, seed it with default seed data
            if (cachedList.length === 0 && DEFAULT_SEEDS[key]) {
                const seeds = DEFAULT_SEEDS[key];
                const itemsToPut = [];
                for (let item of seeds) {
                    if (!item.id) {
                        item.id = this.generateId(key);
                    }
                    itemsToPut.push(item);
                }
                if (itemsToPut.length > 0) {
                    await this.idb.putMany(key, itemsToPut);
                }
                cachedList = await this.idb.getAll(key);
                console.log(`Seeded ${key} into IndexedDB.`);
            }

            this.cache[key] = cachedList;
        }

        // Auto-upgrade processes list if it is outdated/incomplete
        const procesosVersionKey = STORAGE_PREFIX + 'procesos_version_v1';
        if (localStorage.getItem(procesosVersionKey) !== '2026_07_17') {
            this.cache['procesos'] = DEFAULT_SEEDS['procesos'];
            await this.saveToIDB('procesos');
            localStorage.setItem(procesosVersionKey, '2026_07_17');
        }

        // Auto-upgrade tipos_empaque list if it is outdated/incomplete
        const empaquesVersionKey = STORAGE_PREFIX + 'empaques_version_v2';
        if (localStorage.getItem(empaquesVersionKey) !== '2026_07_17_v2') {
            this.cache['tipos_empaque'] = DEFAULT_SEEDS['tipos_empaque'];
            await this.saveToIDB('tipos_empaque');
            localStorage.setItem(empaquesVersionKey, '2026_07_17_v2');
        }

        // Auto-upgrade tipos_caja to the 2026-2027 Catalog
        const cajasVersionKey = STORAGE_PREFIX + 'cajas_version';
        if (localStorage.getItem(cajasVersionKey) !== '2026_2027_v2') {
            this.cache['tipos_caja'] = DEFAULT_SEEDS['tipos_caja'];
            await this.saveToIDB('tipos_caja');
            localStorage.setItem(cajasVersionKey, '2026_2027_v2');
        }

        // Auto-upgrade coeficientes_costeo
        const coefsVersionKey = STORAGE_PREFIX + 'coefs_version';
        if (localStorage.getItem(coefsVersionKey) !== 'v1') {
            this.cache['coeficientes_costeo'] = DEFAULT_SEEDS['coeficientes_costeo'];
            await this.saveToIDB('coeficientes_costeo');
            localStorage.setItem(coefsVersionKey, 'v1');
        }

        // Auto-upgrade turnos configuration to new shift hours
        const turnosHoursKey = STORAGE_PREFIX + 'turnos_hours_version_v3';
        if (localStorage.getItem(turnosHoursKey) !== '2026_07_17') {
            this.cache['turnos'] = DEFAULT_SEEDS['turnos'];
            await this.saveToIDB('turnos');
            localStorage.setItem(turnosHoursKey, '2026_07_17');
        }

        // Auto-upgrade supervisores configuration to add DNI field
        const supervisoresDniKey = STORAGE_PREFIX + 'supervisores_dni_version_v1';
        if (localStorage.getItem(supervisoresDniKey) !== '2026_07_17') {
            this.cache['supervisores'] = DEFAULT_SEEDS['supervisores'];
            await this.saveToIDB('supervisores');
            localStorage.setItem(supervisoresDniKey, '2026_07_17');
        }

        // Auto-upgrade grupos to add area_proceso field
        const gruposAreaKey = STORAGE_PREFIX + 'grupos_area_version_v1';
        if (localStorage.getItem(gruposAreaKey) !== '2026_07_17') {
            this.cache['grupos'] = DEFAULT_SEEDS['grupos'];
            await this.saveToIDB('grupos');
            localStorage.setItem(gruposAreaKey, '2026_07_17');
        }

        // Initialize Firebase Firestore if config is present
        this.initFirestore();
    }

    initFirestore() {
        this.disconnectFirestore();

        // Si el usuario eligió modo desconectado, no iniciar Firebase
        if (localStorage.getItem('pachamama_erp_cloud_disabled') === 'true') {
            console.log("Firebase Firestore is explicitly disabled (Offline Mode).");
            return;
        }

        const defaultConfig = {
            apiKey: "AIzaSyDftZQ37fDyRiSPon9yJWKhdEe-A9Az9f4",
            authDomain: "pachamama-erp.firebaseapp.com",
            databaseURL: "https://pachamama-erp-default-rtdb.firebaseio.com",
            projectId: "pachamama-erp",
            storageBucket: "pachamama-erp.firebasestorage.app",
            messagingSenderId: "908725801094",
            appId: "1:908725801094:web:30925d822bd61ecfd84107",
            measurementId: "G-N96V4K1E66"
        };

        let config = defaultConfig;
        const configStr = localStorage.getItem('pachamama_erp_firebase_config');
        if (configStr) {
            try {
                config = JSON.parse(configStr);
            } catch (e) {
                console.error("Error parsing custom Firebase configuration", e);
            }
        }

        if (config && typeof firebase !== 'undefined') {
            try {
                if (firebase.apps.length === 0) {
                    firebase.initializeApp(config);
                }
                this.firestore = firebase.firestore();
                
                this.firestore.enablePersistence().catch(err => {
                    if (err.code == 'failed-precondition') {
                        console.warn("Multiple tabs open, persistence can only be enabled in one tab.");
                    } else if (err.code == 'unimplemented') {
                        console.warn("The current browser does not support offline persistence.");
                    }
                });

                console.log("Firebase Firestore successfully initialized!");
                this.setupFirestoreListeners();
            } catch (e) {
                console.error("Error initializing Firebase Config", e);
            }
        }
    }

    disconnectFirestore() {
        if (this.listeners && this.listeners.length > 0) {
            this.listeners.forEach(unsubscribe => {
                if (typeof unsubscribe === 'function') unsubscribe();
            });
        }
        this.listeners = [];
        this.firestore = null;
    }

    getFirestoreCollectionKey(localKey) {
        if (localKey === 'recepcion_mp') return 'recepciones_mp';
        if (localKey === 'calibrado_mp') return 'calibrados_mp';
        return localKey;
    }

    getLocalCacheKey(firestoreKey) {
        if (firestoreKey === 'recepciones_mp') return 'recepcion_mp';
        if (firestoreKey === 'calibrados_mp') return 'calibrado_mp';
        return firestoreKey;
    }

    setupFirestoreListeners() {
        if (!this.firestore) return;

        const keys = [
            'empresas', 'clientes', 'proveedores_mp', 'supervisores', 'labores',
            'turnos', 'grupos', 'tipos_caja', 'tipos_empaque', 'programa_exportacion',
            'personal', 'recepciones_mp', 'calibrados_mp', 'produccion_diaria',
            'asistencia_diaria', 'tareo_diario', 'productos'
        ];

        // Dynamic agricultural campaign filter: starts on October 1st of the latest campaign start year
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0 = Jan, 9 = Oct
        const campaignStartYear = currentMonth >= 9 ? currentYear : (currentYear - 1);
        const limitDateStr = `${campaignStartYear}-10-01`; // October 1st of campaign start year (e.g. 2025-10-01)

        keys.forEach(key => {
            const localKey = this.getLocalCacheKey(key);
            
            // Build segment queries for transactional collections
            let query = this.firestore.collection(key);
            if (key === 'recepciones_mp' || key === 'produccion_diaria' || key === 'asistencia_diaria' || key === 'tareo_diario') {
                query = query.where("fecha", ">=", limitDateStr);
            } else if (key === 'calibrados_mp') {
                query = query.where("fecha_calibrado", ">=", limitDateStr);
            }

            const unsubscribe = query.onSnapshot(async snapshot => {
                let changed = false;
                const toPut = [];
                const toDelete = [];

                snapshot.docChanges().forEach(change => {
                    const docData = change.doc.data();
                    const docId = change.doc.id;

                    if (change.type === "added" || change.type === "modified") {
                        if (!this.cache[localKey]) this.cache[localKey] = [];
                        const idx = this.cache[localKey].findIndex(item => item.id === docId);
                        if (idx !== -1) {
                            if (JSON.stringify(this.cache[localKey][idx]) !== JSON.stringify(docData)) {
                                this.cache[localKey][idx] = docData;
                                toPut.push(docData);
                                changed = true;
                            }
                        } else {
                            this.cache[localKey].push(docData);
                            toPut.push(docData);
                            changed = true;
                        }
                    } else if (change.type === "removed") {
                        if (this.cache[localKey]) {
                            const idx = this.cache[localKey].findIndex(item => item.id === docId);
                            if (idx !== -1) {
                                this.cache[localKey].splice(idx, 1);
                                toDelete.push(docId);
                                changed = true;
                            }
                        }
                    }
                });

                if (changed) {
                    if (this.idb) {
                        try {
                            if (toPut.length > 0) {
                                await this.idb.putMany(localKey, toPut);
                            }
                            if (toDelete.length > 0) {
                                await this.idb.deleteMany(localKey, toDelete);
                            }
                        } catch (err) {
                            console.error("IndexedDB batch write error:", err);
                        }
                    }
                    document.dispatchEvent(new CustomEvent('db-changed', { detail: { key: localKey } }));
                }
            }, err => {
                console.error("Firestore onSnapshot error for collection " + key, err);
            });

            this.listeners.push(unsubscribe);
        });
    }

    async pushLocalDataToCloud() {
        if (!this.firestore) throw new Error("No conectado a Firebase Firestore.");
        
        const keys = [
            'empresas', 'clientes', 'proveedores_mp', 'supervisores', 'labores',
            'turnos', 'grupos', 'tipos_caja', 'tipos_empaque', 'programa_exportacion',
            'personal', 'recepciones_mp', 'calibrados_mp', 'produccion_diaria',
            'asistencia_diaria', 'tareo_diario', 'productos'
        ];

        for (let key of keys) {
            const localKey = this.getLocalCacheKey(key);
            const list = this.cache[localKey] || [];
            for (let item of list) {
                if (item.id) {
                    await this.firestore.collection(key).doc(item.id).set(item);
                }
            }
        }
        console.log("All local tables pushed to Google Cloud successfully.");
    }

    save(key) {
        if (this.cache[key] && this.idb) {
            this.saveToIDB(key).catch(err => console.error("IndexedDB write error:", err));
        }
    }

    async saveToIDB(key) {
        await this.idb.clear(key);
        if (this.cache[key] && this.cache[key].length > 0) {
            await this.idb.putMany(key, this.cache[key]);
        }
    }

    getAll(key) {
        return this.cache[key] || [];
    }

    getById(key, id) {
        return this.getAll(key).find(item => item.id === id);
    }

    async insert(key, data) {
        if (!data.id) {
            data.id = this.generateId(key);
        }
        
        if (!this.cache[key]) this.cache[key] = [];
        this.cache[key].push(data);
        
        if (this.idb) {
            await this.idb.put(key, data).catch(err => console.error("IndexedDB insert error:", err));
        }

        if (this.firestore) {
            const firestoreKey = this.getFirestoreCollectionKey(key);
            this.firestore.collection(firestoreKey).doc(data.id).set(data)
                .catch(err => console.error("Firestore sync write error:", err));
        }

        document.dispatchEvent(new CustomEvent('db-changed', { detail: { key: key } }));
        return data;
    }

    async update(key, id, updatedData) {
        if (!this.cache[key]) return null;
        const index = this.cache[key].findIndex(item => item.id === id);
        if (index !== -1) {
            this.cache[key][index] = { ...this.cache[key][index], ...updatedData };
            const merged = this.cache[key][index];
            
            if (this.idb) {
                await this.idb.put(key, merged).catch(err => console.error("IndexedDB update error:", err));
            }

            if (this.firestore) {
                const firestoreKey = this.getFirestoreCollectionKey(key);
                this.firestore.collection(firestoreKey).doc(id).set(merged)
                    .catch(err => console.error("Firestore sync update error:", err));
            }

            document.dispatchEvent(new CustomEvent('db-changed', { detail: { key: key } }));
            return merged;
        }
        return null;
    }

    async delete(key, id) {
        if (!this.cache[key]) return null;
        const index = this.cache[key].findIndex(item => item.id === id);
        if (index !== -1) {
            const removed = this.cache[key].splice(index, 1);
            
            if (this.idb) {
                await this.idb.delete(key, id).catch(err => console.error("IndexedDB delete error:", err));
            }

            if (this.firestore) {
                const firestoreKey = this.getFirestoreCollectionKey(key);
                this.firestore.collection(firestoreKey).doc(id).delete()
                    .catch(err => console.error("Firestore sync delete error:", err));
            }

            document.dispatchEvent(new CustomEvent('db-changed', { detail: { key: key } }));
            return removed[0];
        }
        return null;
    }

    async reset() {
        localStorage.clear();
        if (this.idb) {
            for (let store of this.storeNames) {
                await this.idb.clear(store).catch(err => console.error(err));
            }
        }
        this.disconnectFirestore();
        await this.load();
    }

    async clearOperationalData() {
        const opsStores = ['recepcion_mp', 'calibrado_mp', 'produccion_diaria', 'asistencia_diaria', 'tareo_diario'];
        if (this.idb) {
            for (let store of opsStores) {
                await this.idb.clear(store).catch(err => console.error(err));
                this.cache[store] = [];
            }
        }
    }

    exportAllJSON() {
        const backup = {};
        for (let key of this.storeNames) {
            backup[key] = this.getAll(key);
        }
        return JSON.stringify(backup, null, 2);
    }

    importAllJSON(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            for (let key of this.storeNames) {
                if (data[key]) {
                    this.cache[key] = data[key];
                    this.save(key);
                    
                    if (this.firestore) {
                        data[key].forEach(item => {
                            if (item.id) {
                                this.firestore.collection(key).doc(item.id).set(item)
                                    .catch(err => console.error(err));
                            }
                        });
                    }
                }
            }
            return true;
        } catch (e) {
            console.error("Error importing JSON database backup", e);
            return false;
        }
    }
}

window.db = new Database();
console.log("Pachamama ERP Local Database successfully re-seeded with real Recepciones and Calibrados.");



