(function () {
    'use strict';

    var SEED_MINIMUM_LENGTH = 25;

    function AccountSeedController($scope, loginContext, utilityService,
                                   cryptoService, dialogService, passPhraseService) {
        var vm = this;

        vm.validationOptions = {
            onfocusout: false,
            rules: {
                walletSeed: {
                    required: true,
                    minlength: SEED_MINIMUM_LENGTH
                }
            },
            messages: {
                walletSeed: {
                    required: 'SEED кошелька обязателен',
                    minlength: 'SEED кошелька слишком короткий. Безопасный SEED должен содержать более, чем ' +
                       SEED_MINIMUM_LENGTH + ' символов'
                }
            }
        };
        vm.registerAccount = registerAccount;
        vm.back = goBack;
        vm.refreshAddress = refreshAddress;
        vm.checkSeedAndRegister = checkSeedAndRegister;
        vm.generateSeed = generateSeed;

        function cleanup() {
            //it seems we won't need this code if we switch to recreation of controllers on each event
            vm.seed = '';
            vm.displayAddress = '';
        }

        function refreshAddress() {
            var raw = cryptoService.buildRawAddressFromSeed(vm.seed);
            vm.displayAddress = raw;
        }

        function checkSeedAndRegister(form) {
            if (!form.validate())
                return false;

            if (utilityService.endsWithWhitespace(vm.seed)) {
                dialogService.openNonCloseable('#seed-whitespace-popup');
            }
            else {
                registerAccount();
            }

            return true;
        }

        function generateSeed() {
            vm.seed = passPhraseService.generate();
            refreshAddress();
        }

        function registerAccount() {
            loginContext.showRegisterScreen($scope, vm.seed);
            cleanup();
        }

        function goBack() {
            loginContext.showAccountsListScreen($scope);
            cleanup();
        }
    }

    AccountSeedController.$inject = ['$scope',
        'loginContext',
        'utilityService',
        'cryptoService',
        'dialogService',
        'passPhraseService'];

    angular
        .module('app.login')
        .controller('accountSeedController', AccountSeedController);
})();
