define([
    'Magento_Checkout/js/model/quote',
    'Magento_Customer/js/model/customer',
    'Magento_Checkout/js/action/create-shipping-address'
], function (quote, customer, createShippingAddress) {
    'use strict';

    return function (original) {
        var self = this;

        return original.extend({
            paramsHandler: function () {
                var addressData, newShippingAddress;

                if (typeof this.source === "undefined" || !this.source) {
                    return null;
                }
                addressData = quote.shippingAddress();

                if (customer.isLoggedIn()) {
                    if (customer.getShippingAddressList().length == 0) {
                        addressData = this.source.get(this.dataScopePrefix);
                    }
                } else {
                    addressData = this.source.get(this.dataScopePrefix);
                }

                newShippingAddress = addressData;

                if (customer.isLoggedIn()) {
                    if (customer.getShippingAddressList().length == 0) {
                        newShippingAddress = createShippingAddress(addressData);
                    }
                } else {
                    newShippingAddress = createShippingAddress(addressData);
                }

                var sendCloudAttributesData = JSON.parse(window.sessionStorage.getItem('service-point-data'), function(prop, value) {
                    switch(prop) {
                        case "id":
                            this.sendcloud_service_point_id = value;
                            return;
                        case "city":
                            this.sendcloud_service_point_city = value;
                            return;
                        case "country":
                            this.sendcloud_service_point_country = value;
                            return;
                        case "house_number":
                            this.sendcloud_service_point_house_number = value;
                            return;
                        case "name":
                            this.sendcloud_service_point_name = value;
                            return;
                        case "postal_code":
                            this.sendcloud_service_point_zip_code = value;
                            return;
                        case "street":
                            this.sendcloud_service_point_street = value;
                            return;
                        default:
                            return;
                    }
                });

                if (sendCloudAttributesData) {
                    addressData.extension_attributes = sendCloudAttributesData;
                }

                if (typeof addressData.extension_attributes !== "undefined") {
                    newShippingAddress.extension_attributes = addressData.extension_attributes;
                }

                if (customer.isLoggedIn()) {
                    if (newShippingAddress.customerId) {
                        newShippingAddress.save_in_address_book = 0;
                    } else {
                        newShippingAddress.save_in_address_book = this.shippingAddressView.saveInAddressBook ? "1" : "0";
                    }
                    newShippingAddress.same_as_billing = this.sameAsBilling();
                }

                return newShippingAddress;
            }
        })
    }
});