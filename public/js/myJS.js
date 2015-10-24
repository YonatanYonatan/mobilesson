/**
 * Created by fishman on 10/23/2015.
 */
var app = angular.module('mobilesson', ['ui.bootstrap','ui.router']);

app.config(function($stateProvider,$urlRouterProvider,$locationProvider){
    $urlRouterProvider.otherwise('/searcher');
    $stateProvider
        .state('stackoverflow', {
            templateUrl: '/views/stackoverflow.html'
        })
        .state('flicker', {
            templateUrl: '/views/flicker.html'
        })
        .state('apple', {
            templateUrl: '/views/apple.html'
        })
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
});

app.factory('getResults', ['$http','$state','$window', function($http,$state,$window) {

    return {

        stackoverflow: function (page,tag,vm) {

            var url = 'https://api.stackexchange.com/2.2/search?page='
                +page
                +'&pagesize=30&order=desc&sort=activity&tagged='
                +tag
                +'&site=stackoverflow&filter=!9YdnSQVoS';
            $http.get(url)
                .then(
                    function (response) {
                        // on success
                        //vm.itemsOnPage.push.apply(vm.itemsOnPage, response.data.items);
                        if (response.data.items.length == 0){
                            vm.empty = true;
                        } else {
                            vm.empty = false;
                        }
                        vm.itemsOnPage = response.data.items;
                        vm.total = response.data.total;
                        $state.go('stackoverflow');
                    },
                    function (response) {
                        // on failure
                        console.log('error getting results')
                    }
            );
        },

        stackoverflowExtra: function (vm) {

            var url = 'https://api.stackexchange.com/2.2/search/advanced?page='+vm.page+'&pagesize=30&order=desc&sort=activity&tagged='+vm.searchField+'&site=stackoverflow&filter=!9YdnSQVoS';
            if (vm.date != null){
                url += '&max='+(vm.date.getTime()/1000);
            }
            if (vm.titleField != ""){
                url += '&title='+vm.titleField.replace(/ /g,"-");;
            }
            if (vm.acceptedField != ""){
                url += '&accepted='+vm.acceptedField;
            }
            if (vm.closedField != ""){
                url += '&closed='+vm.closedField;
            }
            if (vm.answersField != ""){
                url += '&answers='+vm.answersField;
            }
            if (vm.bodyField != ""){
                url += '&body='+vm.bodyField.replace(/ /g,"-");
            }
            $http.get(url)
                .then(
                function (response) {
                    // on success
                    //vm.itemsOnPage.push.apply(vm.itemsOnPage, response.data.items);
                    if (response.data.items.length == 0){
                        vm.empty = true;
                    } else {
                        vm.empty = false;
                    }
                    vm.itemsOnPage = response.data.items;
                    vm.total = response.data.total;
                    $state.go('stackoverflow');
                },
                function (response) {
                    // on failure
                    console.log('error getting results')
                }
            );
        },

        flicker: function(page,tag,vm){
            $http.get('https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key='
                +'8abdf9430e33fd718ebf841bf3e93fe8'
                +'&tags='
                +tag
                +'&page='
                +page
                +'&format=json&nojsoncallback=1')
                .then(
                    function (response) {
                        // on success
                        if (response.data.photos.photo.length == 0){
                            vm.empty = true;
                        } else {
                            vm.empty = false;
                        }
                        vm.itemsOnPage = response.data.photos.photo;
                        vm.total = response.data.photos.total;
                        $state.go('flicker');
                    },
                    function (response) {
                    // on failure
                    console.log('error getting results')
                    });

        },

        flickerPhoto: function (id,secret) {
            $http.get('https://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key='
                +'8abdf9430e33fd718ebf841bf3e93fe8'
                +'&photo_id='
                +id
                +'&secret='
                +secret
                +'&format=json&nojsoncallback=1')
                .then(
                function (response) {
                    // on success
                    $window.location.href = response.data.photo.urls.url[0]._content;
                },
                function (response) {
                    // on failure
                    console.log('error getting results')
                });

        },

        apple: function(tag,vm){
            $http.get('https://itunes.apple.com/search?term='+tag)
                .then(
                function (response) {
                    // on success
                    vm.itemsOnPage = response.data.results;
                    vm.total = response.data.resultCount;
                    $state.go('apple');
                },
                function (response) {
                    // on failure
                    console.log('error getting results')
                });

        },

        twitter: function(){
            var s = encodeURIComponent("T7VkoHufbWdKYnAZBmsKvIy1y");
            s += ':'+encodeURIComponent("fDL9sCCaSJbjFgP7XmnqCSfgzlHtwFp7IdRbH3VSnn6Vhiztin");
            var config = {
                headers: {
                    'Authorization': 'Basic ' + btoa(s),
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                },
                data: 'grant_type=client_credentials'
            };

            $http({
                url: 'https://api.twitter.com/oauth2/token',
                method: 'POST',
                headers: {
                    'Authorization': 'Basic ' + btoa(s),
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                },
                data: 'grant_type=client_credentials'
            }).success( function(response){
                // on success
                console.log(response);
            }).error( function (response){
                // on failure
                console.log(response);
            });
        }
    }
}]);

app.controller('filterController', ['getResults', function(getResults){

    var vm = this;

    vm.empty = false;

    vm.searchField = "";

    vm.titleField = "";
    vm.acceptedField = "";
    vm.closedField = "";
    vm.answersField = "";
    vm.bodyField = "";

    vm.itemsOnPage = [];
    vm.total = 0;

    vm.page = 1;

    vm.sites = [
        {
            title: 'stackoverflow',
            isClicked: true
        },
        {
            title: 'flicker',
            isClicked: false
        }
    ];

    vm.search = function(){
        for (var i=0;i<vm.sites.length;i++){
            if (vm.sites[i].isClicked == true){
                if (vm.sites[i].title === 'stackoverflow'){
                    if ((vm.date != null) || (vm.titleField != "") || (vm.acceptedField != "") || (vm.closedField != "") || (vm.answersField != "") || (vm.bodyField != "")){
                        getResults.stackoverflowExtra(vm);

                    } else {
                        getResults.stackoverflow(vm.page,vm.searchField,vm);
                    }
                }
                else if (vm.sites[i].title === 'flicker'){
                    getResults.flicker(vm.page,vm.searchField,vm);
                }
                else if (vm.sites[i].title === 'apple'){
                    getResults.apple(vm.searchField,vm);
                }
                else if (vm.sites[i].title === 'twitter'){
                    getResults.twitter(vm.searchField,vm);
                }
            }
        }
    };

    vm.pageChanged = function(){
        vm.search()
    };

    vm.getPhoto = function(id,secret){
        getResults.flickerPhoto(id,secret)
    };

    vm.boxClicked = function(title){

        if (title == "stackoverflow"){
            vm.showAdvanced = true;
        } else{
            vm.showAdvanced = false;
            vm.advanced = false;
        }

        vm.page = 1;

        for (var i=0;i<vm.sites.length;i++){
            var titleA = vm.sites[i].title;
            if (titleA != title){
                vm.sites[i].isClicked = false
            }
        }
    };

    vm.popover = '/views/popover.html';

    vm.addSite = function(site){
        var nSite = {
            title: site,
            isClicked: false
        };
        vm.sites.push(nSite);
    };

    vm.advanced = false;
    vm.date = null;

    vm.toggleAdvanced = function(){
        vm.advanced = !vm.advanced;
    };

    vm.showAdvanced = true;

    vm.consumerKey = "T7VkoHufbWdKYnAZBmsKvIy1y";
    vm.consumerSecret = "fDL9sCCaSJbjFgP7XmnqCSfgzlHtwFp7IdRbH3VSnn6Vhiztin";
    vm.accessToken = "4025085082-pCnfzKA1Ci8RQ3LbeSzF4XLvPbUyGS5vu2mz3SQ";
    vm.accessTokenSecret = "bTFpifSD5d7rFWz312M12zKxXEoxsrJIbFsJ23xlbv782";

}]);
