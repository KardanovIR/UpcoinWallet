(function () {
    'use strict';

    var WALLET_NAME_MAXLENGTH = 16;

    function AccountRegisterController($scope, accountService, cryptoService, loginContext) {
        var vm = this;

        vm.validationOptions = {
            onfocusout: false,
            rules: {
                walletName: {
                    maxlength: WALLET_NAME_MAXLENGTH
                },
                walletPassword: {
                    required: true,
                    minlength: 8,
                    password: true
                },
                walletPasswordConfirm: {
                    equalTo: '#walletPassword'
                }
            },
            messages: {
                walletName: {
                    maxlength: 'Имя кошелька слишком длинное. Максимальная длина имени — ' +
                        WALLET_NAME_MAXLENGTH + ' символов'
                },
                walletPassword: {
                    required: 'Пароль нужен для сохранения вашего SEED в безопасности',
                    minlength: 'Пароль должен содержать хотя бы 8 символов'
                },
                walletPasswordConfirm: {
                    equalTo: 'Пароли не совпадают'
                }
            }
        };
        vm.saveAccountAndSignIn = saveAccountAndSignIn;
        vm.cancel = cancel;
        vm.seed = function (seed) {
            return arguments.length ? (loginContext.seed = seed) : loginContext.seed;
        };

        function cleanup() {
            vm.name = '';
            vm.password = '';
            vm.confirmPassword = '';
        }

        function saveAccountAndSignIn(form) {
            if (!form.validate())
                return false;

            var seed = loginContext.seed;
            var cipher = cryptoService.encryptWalletSeed(seed, vm.password).toString();
            var keys = cryptoService.getKeyPair(seed);
            var checksum = cryptoService.seedChecksum(seed);
            var address = cryptoService.buildRawAddress(keys.public);

            var account = {
                name: vm.name,
                cipher: cipher,
                checksum: checksum,
                publicKey: keys.public,
                address: address
            };

            accountService.addAccount(account);

            loginContext.notifySignedIn($scope, address, seed, keys);

            cleanup();

            return true;
        }

        function cancel() {
            loginContext.showAccountsListScreen($scope);
            cleanup();
        }
    }

    AccountRegisterController.$inject = ['$scope', 'accountService', 'cryptoService', 'loginContext'];

    angular
        .module('app.login')
        .controller('accountRegisterController', AccountRegisterController);
})();
