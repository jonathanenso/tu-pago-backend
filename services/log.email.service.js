const db = require('../_helpers/db');
const LogEmail = db.LogEmail;
var moment = require('moment');
let logEmailService = {

    /**
     * Funcion para obtener los logs de emails con paginación y filtros
     */
    dataTable: async (logEmailParam) => {

        // resultados por página
        const pageSize = logEmailParam.pageSize;
        // Página: el page index de react-table-component
        const pageIndex = logEmailParam.pageIndex; 
        // Query a aplicar
        var query = {};
        
        //filtros
        if(logEmailParam.globalFilter && Object.keys(logEmailParam.globalFilter).length){
            let regex = new RegExp(logEmailParam.globalFilter,'gi');
            query =  { $or: [{code: regex },{firstName: regex },{lastName: regex },{emailTo: regex}, {emailSubject: regex}, {result: regex} ] }

            //Verificar si tiene formato de fecha 
            try{
                if(logEmailParam.globalFilter.length == 10){
                    // parse date strict mode
                    let momentDate = moment(logEmailParam.globalFilter , "YYYY-MM-DD", true);
                    let validDate = momentDate.isValid();
                    if(validDate){
                        let startDate = moment(logEmailParam.globalFilter, "YYYY-MM-DD");
                        let endDate = moment(logEmailParam.globalFilter).add(1, 'day').format("YYYY-MM-DD");
                        query = { $or: [{code: regex },{firstName: regex },{lastName: regex },{emailTo: regex}, {emailSubject: regex}, {result: regex},{createdDate: { $gte: startDate, $lt: endDate }}]}
                    }       
                }
            }catch(e){
                //
            }
           
        }

        //default sort
        var sortBy = {createdDate: 'desc'};

        //Si esta el parametro se crea el objeto para ordenar adecuadamente
        if(logEmailParam.sortBy){
            let direction = logEmailParam.sortBy.desc == true ? 'desc':'asc'
            sortBy = { [logEmailParam.sortBy.id] : direction } 
        }
       
        const logEmail = await LogEmail.find(query).sort(sortBy)
            .skip((pageSize * pageIndex) - pageSize)
            .limit(pageSize);

        //Cantidad de productos archivados
        let numOflogEmail = await LogEmail.countDocuments(query)

        return {
            results: logEmail, 
            currentPage: pageIndex, 
            pageCount: Math.ceil(numOflogEmail / pageSize),
            numOfResults: numOflogEmail
        }
    },

}

module.exports = logEmailService;