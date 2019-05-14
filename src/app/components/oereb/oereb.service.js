export class OEREBService {
    constructor(Config, $http, $log, $base64, Notification, $filter, $translate) {
        'ngInject';

        this.$http = $http;
        this.$log = $log;
        this.$base64 = $base64;
        this.$filter = $filter;
        this.$translate = $translate;
        this.Notification = Notification;
        this.Config = Config;

        this.reducedExtractPath = 'extract/reduced/xml/';
    }

    getExtractById(egrid) {
        let lang = this.$translate.use() !== undefined ? this.$translate.use() : this.$translate.proposedLanguage();
        let url = 'http://localhost:8080/assets/weisung/1_DE_PYRAMID.json'; // todo: make dynamic

        return this.$http.get(url, {
                cache: false,
                transformResponse: (response) => {
                    let data = JSON.parse(response);

                    if (!angular.isObject(data)) {
                        return false;
                    }

                    if (! angular.isDefined(data.GetExtractByIdResponse)) {
                        return false;
                    }

                    return data.GetExtractByIdResponse.extract;
                }
            }).catch(() => {
                this.Notification.warning(this.$filter('translate')('oerebServiceNotAvailable'));
            }
        );
    }

    getEGRID(coordinates) {
        let long = coordinates[4326][1];
        let lat = coordinates[4326][0];

        let url = this.Config.services.oereb + '/getegrid/?GNSS=' + long + ',' + lat;

        let promise = this.$http.get(
            url,
            {
                cache: true,
                transformResponse: (data) => {
                    if (data.status == 204)
                        throw data;

                    let x2js = new X2JS();
                    let object = x2js.xml_str2json(data);

                    if (!object || !object.GetEGRIDResponse) {
                        return false;
                    }

                    if (angular.isArray(object.GetEGRIDResponse.egrid)) {
                        let results = [];
                        for (let i = 0; i < object.GetEGRIDResponse.egrid.length; i++) {
                            results[i] = {
                                'egrid': object.GetEGRIDResponse.egrid[i],
                                'number': object.GetEGRIDResponse.number[i]
                            }
                        }
                        return results;
                    }

                    return [{
                        'egrid': object.GetEGRIDResponse.egrid,
                        'number': object.GetEGRIDResponse.number
                    }];
                }
            }
        ).catch((data) => {

            let warning = this.$filter('translate')('oerebServiceNotAvailable');

            if (data.status == 500)
                warning = this.$filter('translate')('oerebService500');

            if (data.status == 204)
                warning = this.$filter('translate')('oerebService204');

            this.Notification.warning(warning);
        });

        return promise;
    }
}
