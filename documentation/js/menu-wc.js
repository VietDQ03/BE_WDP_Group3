'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">nest-basic-vietdang documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AppModule-f3a97a93b81acdb22f4b238d7ad49a47e30b654419afbea12ca459a9c76779a0e8aac395c97f416193f597a62eb004930570e02bf4e832397fdcda1f1433a073"' : 'data-bs-target="#xs-controllers-links-module-AppModule-f3a97a93b81acdb22f4b238d7ad49a47e30b654419afbea12ca459a9c76779a0e8aac395c97f416193f597a62eb004930570e02bf4e832397fdcda1f1433a073"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AppModule-f3a97a93b81acdb22f4b238d7ad49a47e30b654419afbea12ca459a9c76779a0e8aac395c97f416193f597a62eb004930570e02bf4e832397fdcda1f1433a073"' :
                                            'id="xs-controllers-links-module-AppModule-f3a97a93b81acdb22f4b238d7ad49a47e30b654419afbea12ca459a9c76779a0e8aac395c97f416193f597a62eb004930570e02bf4e832397fdcda1f1433a073"' }>
                                            <li class="link">
                                                <a href="controllers/AppController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AppModule-f3a97a93b81acdb22f4b238d7ad49a47e30b654419afbea12ca459a9c76779a0e8aac395c97f416193f597a62eb004930570e02bf4e832397fdcda1f1433a073"' : 'data-bs-target="#xs-injectables-links-module-AppModule-f3a97a93b81acdb22f4b238d7ad49a47e30b654419afbea12ca459a9c76779a0e8aac395c97f416193f597a62eb004930570e02bf4e832397fdcda1f1433a073"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AppModule-f3a97a93b81acdb22f4b238d7ad49a47e30b654419afbea12ca459a9c76779a0e8aac395c97f416193f597a62eb004930570e02bf4e832397fdcda1f1433a073"' :
                                        'id="xs-injectables-links-module-AppModule-f3a97a93b81acdb22f4b238d7ad49a47e30b654419afbea12ca459a9c76779a0e8aac395c97f416193f597a62eb004930570e02bf4e832397fdcda1f1433a073"' }>
                                        <li class="link">
                                            <a href="injectables/AppService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AuthModule.html" data-type="entity-link" >AuthModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AuthModule-e348326be9605a46cd108d62584006f0e83f1bb7a6cce61746feb4d670def159d2e6aba343b3debb62ea807cb894b9b944238d9fb15955acf4d7ff74ceecf6cb"' : 'data-bs-target="#xs-controllers-links-module-AuthModule-e348326be9605a46cd108d62584006f0e83f1bb7a6cce61746feb4d670def159d2e6aba343b3debb62ea807cb894b9b944238d9fb15955acf4d7ff74ceecf6cb"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AuthModule-e348326be9605a46cd108d62584006f0e83f1bb7a6cce61746feb4d670def159d2e6aba343b3debb62ea807cb894b9b944238d9fb15955acf4d7ff74ceecf6cb"' :
                                            'id="xs-controllers-links-module-AuthModule-e348326be9605a46cd108d62584006f0e83f1bb7a6cce61746feb4d670def159d2e6aba343b3debb62ea807cb894b9b944238d9fb15955acf4d7ff74ceecf6cb"' }>
                                            <li class="link">
                                                <a href="controllers/AuthController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AuthModule-e348326be9605a46cd108d62584006f0e83f1bb7a6cce61746feb4d670def159d2e6aba343b3debb62ea807cb894b9b944238d9fb15955acf4d7ff74ceecf6cb"' : 'data-bs-target="#xs-injectables-links-module-AuthModule-e348326be9605a46cd108d62584006f0e83f1bb7a6cce61746feb4d670def159d2e6aba343b3debb62ea807cb894b9b944238d9fb15955acf4d7ff74ceecf6cb"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AuthModule-e348326be9605a46cd108d62584006f0e83f1bb7a6cce61746feb4d670def159d2e6aba343b3debb62ea807cb894b9b944238d9fb15955acf4d7ff74ceecf6cb"' :
                                        'id="xs-injectables-links-module-AuthModule-e348326be9605a46cd108d62584006f0e83f1bb7a6cce61746feb4d670def159d2e6aba343b3debb62ea807cb894b9b944238d9fb15955acf4d7ff74ceecf6cb"' }>
                                        <li class="link">
                                            <a href="injectables/AuthService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/JwtStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >JwtStrategy</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/LocalStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LocalStrategy</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/CompaniesModule.html" data-type="entity-link" >CompaniesModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-CompaniesModule-a4266818461ad9297b2082a5bb658a4173d4fa229fa93ea0ff7376530aadf5ab516d8b30549bb80eae1f17e796eafe8ebfd797a9b37b08209ca57881b68679be"' : 'data-bs-target="#xs-controllers-links-module-CompaniesModule-a4266818461ad9297b2082a5bb658a4173d4fa229fa93ea0ff7376530aadf5ab516d8b30549bb80eae1f17e796eafe8ebfd797a9b37b08209ca57881b68679be"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-CompaniesModule-a4266818461ad9297b2082a5bb658a4173d4fa229fa93ea0ff7376530aadf5ab516d8b30549bb80eae1f17e796eafe8ebfd797a9b37b08209ca57881b68679be"' :
                                            'id="xs-controllers-links-module-CompaniesModule-a4266818461ad9297b2082a5bb658a4173d4fa229fa93ea0ff7376530aadf5ab516d8b30549bb80eae1f17e796eafe8ebfd797a9b37b08209ca57881b68679be"' }>
                                            <li class="link">
                                                <a href="controllers/CompaniesController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CompaniesController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-CompaniesModule-a4266818461ad9297b2082a5bb658a4173d4fa229fa93ea0ff7376530aadf5ab516d8b30549bb80eae1f17e796eafe8ebfd797a9b37b08209ca57881b68679be"' : 'data-bs-target="#xs-injectables-links-module-CompaniesModule-a4266818461ad9297b2082a5bb658a4173d4fa229fa93ea0ff7376530aadf5ab516d8b30549bb80eae1f17e796eafe8ebfd797a9b37b08209ca57881b68679be"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-CompaniesModule-a4266818461ad9297b2082a5bb658a4173d4fa229fa93ea0ff7376530aadf5ab516d8b30549bb80eae1f17e796eafe8ebfd797a9b37b08209ca57881b68679be"' :
                                        'id="xs-injectables-links-module-CompaniesModule-a4266818461ad9297b2082a5bb658a4173d4fa229fa93ea0ff7376530aadf5ab516d8b30549bb80eae1f17e796eafe8ebfd797a9b37b08209ca57881b68679be"' }>
                                        <li class="link">
                                            <a href="injectables/CompaniesService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CompaniesService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/DatabasesModule.html" data-type="entity-link" >DatabasesModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-DatabasesModule-091d1ac2c972292d293c47ac61e4d04a5bb0458bc9f7a065f890bbf84fc1644271d58abcae510e19236cdcff11be00094b4415ebd54a6eff0d328eef82b1a37e"' : 'data-bs-target="#xs-controllers-links-module-DatabasesModule-091d1ac2c972292d293c47ac61e4d04a5bb0458bc9f7a065f890bbf84fc1644271d58abcae510e19236cdcff11be00094b4415ebd54a6eff0d328eef82b1a37e"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-DatabasesModule-091d1ac2c972292d293c47ac61e4d04a5bb0458bc9f7a065f890bbf84fc1644271d58abcae510e19236cdcff11be00094b4415ebd54a6eff0d328eef82b1a37e"' :
                                            'id="xs-controllers-links-module-DatabasesModule-091d1ac2c972292d293c47ac61e4d04a5bb0458bc9f7a065f890bbf84fc1644271d58abcae510e19236cdcff11be00094b4415ebd54a6eff0d328eef82b1a37e"' }>
                                            <li class="link">
                                                <a href="controllers/DatabasesController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DatabasesController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-DatabasesModule-091d1ac2c972292d293c47ac61e4d04a5bb0458bc9f7a065f890bbf84fc1644271d58abcae510e19236cdcff11be00094b4415ebd54a6eff0d328eef82b1a37e"' : 'data-bs-target="#xs-injectables-links-module-DatabasesModule-091d1ac2c972292d293c47ac61e4d04a5bb0458bc9f7a065f890bbf84fc1644271d58abcae510e19236cdcff11be00094b4415ebd54a6eff0d328eef82b1a37e"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-DatabasesModule-091d1ac2c972292d293c47ac61e4d04a5bb0458bc9f7a065f890bbf84fc1644271d58abcae510e19236cdcff11be00094b4415ebd54a6eff0d328eef82b1a37e"' :
                                        'id="xs-injectables-links-module-DatabasesModule-091d1ac2c972292d293c47ac61e4d04a5bb0458bc9f7a065f890bbf84fc1644271d58abcae510e19236cdcff11be00094b4415ebd54a6eff0d328eef82b1a37e"' }>
                                        <li class="link">
                                            <a href="injectables/DatabasesService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DatabasesService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/UsersService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UsersService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/FilesModule.html" data-type="entity-link" >FilesModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-FilesModule-151232b12a0dea79449612728b380f0ad569d98297e87bcfacbde172f9cfb30c7c77ce54a16c57939d46b34ecefe4103cf7b68fa7babf6ec5338934a031d2864"' : 'data-bs-target="#xs-controllers-links-module-FilesModule-151232b12a0dea79449612728b380f0ad569d98297e87bcfacbde172f9cfb30c7c77ce54a16c57939d46b34ecefe4103cf7b68fa7babf6ec5338934a031d2864"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-FilesModule-151232b12a0dea79449612728b380f0ad569d98297e87bcfacbde172f9cfb30c7c77ce54a16c57939d46b34ecefe4103cf7b68fa7babf6ec5338934a031d2864"' :
                                            'id="xs-controllers-links-module-FilesModule-151232b12a0dea79449612728b380f0ad569d98297e87bcfacbde172f9cfb30c7c77ce54a16c57939d46b34ecefe4103cf7b68fa7babf6ec5338934a031d2864"' }>
                                            <li class="link">
                                                <a href="controllers/FilesController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FilesController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-FilesModule-151232b12a0dea79449612728b380f0ad569d98297e87bcfacbde172f9cfb30c7c77ce54a16c57939d46b34ecefe4103cf7b68fa7babf6ec5338934a031d2864"' : 'data-bs-target="#xs-injectables-links-module-FilesModule-151232b12a0dea79449612728b380f0ad569d98297e87bcfacbde172f9cfb30c7c77ce54a16c57939d46b34ecefe4103cf7b68fa7babf6ec5338934a031d2864"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-FilesModule-151232b12a0dea79449612728b380f0ad569d98297e87bcfacbde172f9cfb30c7c77ce54a16c57939d46b34ecefe4103cf7b68fa7babf6ec5338934a031d2864"' :
                                        'id="xs-injectables-links-module-FilesModule-151232b12a0dea79449612728b380f0ad569d98297e87bcfacbde172f9cfb30c7c77ce54a16c57939d46b34ecefe4103cf7b68fa7babf6ec5338934a031d2864"' }>
                                        <li class="link">
                                            <a href="injectables/FilesService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FilesService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/HealthModule.html" data-type="entity-link" >HealthModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-HealthModule-960838242a351acf1e1c2c5dd2420145e651dd208c81b8cd10325c1fd14d435d135419b68a0d99909a8bc7f9792831e041d3f107a99eb7c95d399633e20f3cba"' : 'data-bs-target="#xs-controllers-links-module-HealthModule-960838242a351acf1e1c2c5dd2420145e651dd208c81b8cd10325c1fd14d435d135419b68a0d99909a8bc7f9792831e041d3f107a99eb7c95d399633e20f3cba"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-HealthModule-960838242a351acf1e1c2c5dd2420145e651dd208c81b8cd10325c1fd14d435d135419b68a0d99909a8bc7f9792831e041d3f107a99eb7c95d399633e20f3cba"' :
                                            'id="xs-controllers-links-module-HealthModule-960838242a351acf1e1c2c5dd2420145e651dd208c81b8cd10325c1fd14d435d135419b68a0d99909a8bc7f9792831e041d3f107a99eb7c95d399633e20f3cba"' }>
                                            <li class="link">
                                                <a href="controllers/HealthController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HealthController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-HealthModule-960838242a351acf1e1c2c5dd2420145e651dd208c81b8cd10325c1fd14d435d135419b68a0d99909a8bc7f9792831e041d3f107a99eb7c95d399633e20f3cba"' : 'data-bs-target="#xs-injectables-links-module-HealthModule-960838242a351acf1e1c2c5dd2420145e651dd208c81b8cd10325c1fd14d435d135419b68a0d99909a8bc7f9792831e041d3f107a99eb7c95d399633e20f3cba"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-HealthModule-960838242a351acf1e1c2c5dd2420145e651dd208c81b8cd10325c1fd14d435d135419b68a0d99909a8bc7f9792831e041d3f107a99eb7c95d399633e20f3cba"' :
                                        'id="xs-injectables-links-module-HealthModule-960838242a351acf1e1c2c5dd2420145e651dd208c81b8cd10325c1fd14d435d135419b68a0d99909a8bc7f9792831e041d3f107a99eb7c95d399633e20f3cba"' }>
                                        <li class="link">
                                            <a href="injectables/HealthService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HealthService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/JobsModule.html" data-type="entity-link" >JobsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-JobsModule-1b1c964618d3d2b85c4207d26d0c3a870e49ca78deb4ad571859ae037f3fd178d14900c6ce6a665a860e5518567db702baf16eba24a5582ef2db4fecdd03f4b1"' : 'data-bs-target="#xs-controllers-links-module-JobsModule-1b1c964618d3d2b85c4207d26d0c3a870e49ca78deb4ad571859ae037f3fd178d14900c6ce6a665a860e5518567db702baf16eba24a5582ef2db4fecdd03f4b1"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-JobsModule-1b1c964618d3d2b85c4207d26d0c3a870e49ca78deb4ad571859ae037f3fd178d14900c6ce6a665a860e5518567db702baf16eba24a5582ef2db4fecdd03f4b1"' :
                                            'id="xs-controllers-links-module-JobsModule-1b1c964618d3d2b85c4207d26d0c3a870e49ca78deb4ad571859ae037f3fd178d14900c6ce6a665a860e5518567db702baf16eba24a5582ef2db4fecdd03f4b1"' }>
                                            <li class="link">
                                                <a href="controllers/JobsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >JobsController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-JobsModule-1b1c964618d3d2b85c4207d26d0c3a870e49ca78deb4ad571859ae037f3fd178d14900c6ce6a665a860e5518567db702baf16eba24a5582ef2db4fecdd03f4b1"' : 'data-bs-target="#xs-injectables-links-module-JobsModule-1b1c964618d3d2b85c4207d26d0c3a870e49ca78deb4ad571859ae037f3fd178d14900c6ce6a665a860e5518567db702baf16eba24a5582ef2db4fecdd03f4b1"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-JobsModule-1b1c964618d3d2b85c4207d26d0c3a870e49ca78deb4ad571859ae037f3fd178d14900c6ce6a665a860e5518567db702baf16eba24a5582ef2db4fecdd03f4b1"' :
                                        'id="xs-injectables-links-module-JobsModule-1b1c964618d3d2b85c4207d26d0c3a870e49ca78deb4ad571859ae037f3fd178d14900c6ce6a665a860e5518567db702baf16eba24a5582ef2db4fecdd03f4b1"' }>
                                        <li class="link">
                                            <a href="injectables/JobsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >JobsService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/MailModule.html" data-type="entity-link" >MailModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-MailModule-13759274aabde94ab694ae219ac023299fd430434c47b6328bf087d453231d7d0c21bac3044ad6f910dad70f73aa0434e60b24230946def1bebb4a0dbd4c9ecf"' : 'data-bs-target="#xs-controllers-links-module-MailModule-13759274aabde94ab694ae219ac023299fd430434c47b6328bf087d453231d7d0c21bac3044ad6f910dad70f73aa0434e60b24230946def1bebb4a0dbd4c9ecf"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-MailModule-13759274aabde94ab694ae219ac023299fd430434c47b6328bf087d453231d7d0c21bac3044ad6f910dad70f73aa0434e60b24230946def1bebb4a0dbd4c9ecf"' :
                                            'id="xs-controllers-links-module-MailModule-13759274aabde94ab694ae219ac023299fd430434c47b6328bf087d453231d7d0c21bac3044ad6f910dad70f73aa0434e60b24230946def1bebb4a0dbd4c9ecf"' }>
                                            <li class="link">
                                                <a href="controllers/MailController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MailController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-MailModule-13759274aabde94ab694ae219ac023299fd430434c47b6328bf087d453231d7d0c21bac3044ad6f910dad70f73aa0434e60b24230946def1bebb4a0dbd4c9ecf"' : 'data-bs-target="#xs-injectables-links-module-MailModule-13759274aabde94ab694ae219ac023299fd430434c47b6328bf087d453231d7d0c21bac3044ad6f910dad70f73aa0434e60b24230946def1bebb4a0dbd4c9ecf"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-MailModule-13759274aabde94ab694ae219ac023299fd430434c47b6328bf087d453231d7d0c21bac3044ad6f910dad70f73aa0434e60b24230946def1bebb4a0dbd4c9ecf"' :
                                        'id="xs-injectables-links-module-MailModule-13759274aabde94ab694ae219ac023299fd430434c47b6328bf087d453231d7d0c21bac3044ad6f910dad70f73aa0434e60b24230946def1bebb4a0dbd4c9ecf"' }>
                                        <li class="link">
                                            <a href="injectables/MailService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MailService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/PermissionsModule.html" data-type="entity-link" >PermissionsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-PermissionsModule-37156ce13c893d6e166f40d5ca17b30c30784c6dec62aa57b26a48234c4bdaa544f4f32b2d08a09401f97ef0dc9282a2577a901f7e568ad0ac5c15ab24bcdd1d"' : 'data-bs-target="#xs-controllers-links-module-PermissionsModule-37156ce13c893d6e166f40d5ca17b30c30784c6dec62aa57b26a48234c4bdaa544f4f32b2d08a09401f97ef0dc9282a2577a901f7e568ad0ac5c15ab24bcdd1d"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-PermissionsModule-37156ce13c893d6e166f40d5ca17b30c30784c6dec62aa57b26a48234c4bdaa544f4f32b2d08a09401f97ef0dc9282a2577a901f7e568ad0ac5c15ab24bcdd1d"' :
                                            'id="xs-controllers-links-module-PermissionsModule-37156ce13c893d6e166f40d5ca17b30c30784c6dec62aa57b26a48234c4bdaa544f4f32b2d08a09401f97ef0dc9282a2577a901f7e568ad0ac5c15ab24bcdd1d"' }>
                                            <li class="link">
                                                <a href="controllers/PermissionsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PermissionsController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-PermissionsModule-37156ce13c893d6e166f40d5ca17b30c30784c6dec62aa57b26a48234c4bdaa544f4f32b2d08a09401f97ef0dc9282a2577a901f7e568ad0ac5c15ab24bcdd1d"' : 'data-bs-target="#xs-injectables-links-module-PermissionsModule-37156ce13c893d6e166f40d5ca17b30c30784c6dec62aa57b26a48234c4bdaa544f4f32b2d08a09401f97ef0dc9282a2577a901f7e568ad0ac5c15ab24bcdd1d"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-PermissionsModule-37156ce13c893d6e166f40d5ca17b30c30784c6dec62aa57b26a48234c4bdaa544f4f32b2d08a09401f97ef0dc9282a2577a901f7e568ad0ac5c15ab24bcdd1d"' :
                                        'id="xs-injectables-links-module-PermissionsModule-37156ce13c893d6e166f40d5ca17b30c30784c6dec62aa57b26a48234c4bdaa544f4f32b2d08a09401f97ef0dc9282a2577a901f7e568ad0ac5c15ab24bcdd1d"' }>
                                        <li class="link">
                                            <a href="injectables/PermissionsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PermissionsService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ResumesModule.html" data-type="entity-link" >ResumesModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-ResumesModule-1adbd3a6c38770e06f04b7b75779d08b9429d480a2e7ca90d7561b73f2964a87c26275df8245388b89f1b985a49411b91812949a75f5cd40630a1a6c05bd128b"' : 'data-bs-target="#xs-controllers-links-module-ResumesModule-1adbd3a6c38770e06f04b7b75779d08b9429d480a2e7ca90d7561b73f2964a87c26275df8245388b89f1b985a49411b91812949a75f5cd40630a1a6c05bd128b"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ResumesModule-1adbd3a6c38770e06f04b7b75779d08b9429d480a2e7ca90d7561b73f2964a87c26275df8245388b89f1b985a49411b91812949a75f5cd40630a1a6c05bd128b"' :
                                            'id="xs-controllers-links-module-ResumesModule-1adbd3a6c38770e06f04b7b75779d08b9429d480a2e7ca90d7561b73f2964a87c26275df8245388b89f1b985a49411b91812949a75f5cd40630a1a6c05bd128b"' }>
                                            <li class="link">
                                                <a href="controllers/ResumesController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ResumesController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ResumesModule-1adbd3a6c38770e06f04b7b75779d08b9429d480a2e7ca90d7561b73f2964a87c26275df8245388b89f1b985a49411b91812949a75f5cd40630a1a6c05bd128b"' : 'data-bs-target="#xs-injectables-links-module-ResumesModule-1adbd3a6c38770e06f04b7b75779d08b9429d480a2e7ca90d7561b73f2964a87c26275df8245388b89f1b985a49411b91812949a75f5cd40630a1a6c05bd128b"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ResumesModule-1adbd3a6c38770e06f04b7b75779d08b9429d480a2e7ca90d7561b73f2964a87c26275df8245388b89f1b985a49411b91812949a75f5cd40630a1a6c05bd128b"' :
                                        'id="xs-injectables-links-module-ResumesModule-1adbd3a6c38770e06f04b7b75779d08b9429d480a2e7ca90d7561b73f2964a87c26275df8245388b89f1b985a49411b91812949a75f5cd40630a1a6c05bd128b"' }>
                                        <li class="link">
                                            <a href="injectables/ResumesService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ResumesService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/RolesModule.html" data-type="entity-link" >RolesModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-RolesModule-1ac512fabc3ae30609ca8dd0503904e5e9edd34eeff342e572620d9d7fb3f3b3ae9e16a20ed075155fe6c111d4b9e536b09b11b4307def4b064aedecce92874c"' : 'data-bs-target="#xs-controllers-links-module-RolesModule-1ac512fabc3ae30609ca8dd0503904e5e9edd34eeff342e572620d9d7fb3f3b3ae9e16a20ed075155fe6c111d4b9e536b09b11b4307def4b064aedecce92874c"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-RolesModule-1ac512fabc3ae30609ca8dd0503904e5e9edd34eeff342e572620d9d7fb3f3b3ae9e16a20ed075155fe6c111d4b9e536b09b11b4307def4b064aedecce92874c"' :
                                            'id="xs-controllers-links-module-RolesModule-1ac512fabc3ae30609ca8dd0503904e5e9edd34eeff342e572620d9d7fb3f3b3ae9e16a20ed075155fe6c111d4b9e536b09b11b4307def4b064aedecce92874c"' }>
                                            <li class="link">
                                                <a href="controllers/RolesController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RolesController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-RolesModule-1ac512fabc3ae30609ca8dd0503904e5e9edd34eeff342e572620d9d7fb3f3b3ae9e16a20ed075155fe6c111d4b9e536b09b11b4307def4b064aedecce92874c"' : 'data-bs-target="#xs-injectables-links-module-RolesModule-1ac512fabc3ae30609ca8dd0503904e5e9edd34eeff342e572620d9d7fb3f3b3ae9e16a20ed075155fe6c111d4b9e536b09b11b4307def4b064aedecce92874c"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-RolesModule-1ac512fabc3ae30609ca8dd0503904e5e9edd34eeff342e572620d9d7fb3f3b3ae9e16a20ed075155fe6c111d4b9e536b09b11b4307def4b064aedecce92874c"' :
                                        'id="xs-injectables-links-module-RolesModule-1ac512fabc3ae30609ca8dd0503904e5e9edd34eeff342e572620d9d7fb3f3b3ae9e16a20ed075155fe6c111d4b9e536b09b11b4307def4b064aedecce92874c"' }>
                                        <li class="link">
                                            <a href="injectables/RolesService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RolesService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/SubscribersModule.html" data-type="entity-link" >SubscribersModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-SubscribersModule-64209b99c3976bc6f30403e728356c532472e86909b761575785f4444589c157189a236d6c8a30901ffd2e6f3db3cc905b505388a53a387d27acf2e0713023eb"' : 'data-bs-target="#xs-controllers-links-module-SubscribersModule-64209b99c3976bc6f30403e728356c532472e86909b761575785f4444589c157189a236d6c8a30901ffd2e6f3db3cc905b505388a53a387d27acf2e0713023eb"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-SubscribersModule-64209b99c3976bc6f30403e728356c532472e86909b761575785f4444589c157189a236d6c8a30901ffd2e6f3db3cc905b505388a53a387d27acf2e0713023eb"' :
                                            'id="xs-controllers-links-module-SubscribersModule-64209b99c3976bc6f30403e728356c532472e86909b761575785f4444589c157189a236d6c8a30901ffd2e6f3db3cc905b505388a53a387d27acf2e0713023eb"' }>
                                            <li class="link">
                                                <a href="controllers/SubscribersController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SubscribersController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-SubscribersModule-64209b99c3976bc6f30403e728356c532472e86909b761575785f4444589c157189a236d6c8a30901ffd2e6f3db3cc905b505388a53a387d27acf2e0713023eb"' : 'data-bs-target="#xs-injectables-links-module-SubscribersModule-64209b99c3976bc6f30403e728356c532472e86909b761575785f4444589c157189a236d6c8a30901ffd2e6f3db3cc905b505388a53a387d27acf2e0713023eb"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-SubscribersModule-64209b99c3976bc6f30403e728356c532472e86909b761575785f4444589c157189a236d6c8a30901ffd2e6f3db3cc905b505388a53a387d27acf2e0713023eb"' :
                                        'id="xs-injectables-links-module-SubscribersModule-64209b99c3976bc6f30403e728356c532472e86909b761575785f4444589c157189a236d6c8a30901ffd2e6f3db3cc905b505388a53a387d27acf2e0713023eb"' }>
                                        <li class="link">
                                            <a href="injectables/SubscribersService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SubscribersService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/UsersModule.html" data-type="entity-link" >UsersModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-UsersModule-f2ed63e3dfde874d79d2bfca6736b5b7f3023460e3b76c0f530c5ba68bfee5c85ba6b079b2f31577d473eeccb95dc00d3b4b7d5a6ddbb614206bc50e522a0d66"' : 'data-bs-target="#xs-controllers-links-module-UsersModule-f2ed63e3dfde874d79d2bfca6736b5b7f3023460e3b76c0f530c5ba68bfee5c85ba6b079b2f31577d473eeccb95dc00d3b4b7d5a6ddbb614206bc50e522a0d66"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-UsersModule-f2ed63e3dfde874d79d2bfca6736b5b7f3023460e3b76c0f530c5ba68bfee5c85ba6b079b2f31577d473eeccb95dc00d3b4b7d5a6ddbb614206bc50e522a0d66"' :
                                            'id="xs-controllers-links-module-UsersModule-f2ed63e3dfde874d79d2bfca6736b5b7f3023460e3b76c0f530c5ba68bfee5c85ba6b079b2f31577d473eeccb95dc00d3b4b7d5a6ddbb614206bc50e522a0d66"' }>
                                            <li class="link">
                                                <a href="controllers/UsersController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UsersController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-UsersModule-f2ed63e3dfde874d79d2bfca6736b5b7f3023460e3b76c0f530c5ba68bfee5c85ba6b079b2f31577d473eeccb95dc00d3b4b7d5a6ddbb614206bc50e522a0d66"' : 'data-bs-target="#xs-injectables-links-module-UsersModule-f2ed63e3dfde874d79d2bfca6736b5b7f3023460e3b76c0f530c5ba68bfee5c85ba6b079b2f31577d473eeccb95dc00d3b4b7d5a6ddbb614206bc50e522a0d66"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-UsersModule-f2ed63e3dfde874d79d2bfca6736b5b7f3023460e3b76c0f530c5ba68bfee5c85ba6b079b2f31577d473eeccb95dc00d3b4b7d5a6ddbb614206bc50e522a0d66"' :
                                        'id="xs-injectables-links-module-UsersModule-f2ed63e3dfde874d79d2bfca6736b5b7f3023460e3b76c0f530c5ba68bfee5c85ba6b079b2f31577d473eeccb95dc00d3b4b7d5a6ddbb614206bc50e522a0d66"' }>
                                        <li class="link">
                                            <a href="injectables/UsersService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UsersService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#controllers-links"' :
                                'data-bs-target="#xs-controllers-links"' }>
                                <span class="icon ion-md-swap"></span>
                                <span>Controllers</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="controllers-links"' : 'id="xs-controllers-links"' }>
                                <li class="link">
                                    <a href="controllers/AppController.html" data-type="entity-link" >AppController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/AuthController.html" data-type="entity-link" >AuthController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/CompaniesController.html" data-type="entity-link" >CompaniesController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/DatabasesController.html" data-type="entity-link" >DatabasesController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/FilesController.html" data-type="entity-link" >FilesController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/HealthController.html" data-type="entity-link" >HealthController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/JobsController.html" data-type="entity-link" >JobsController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/MailController.html" data-type="entity-link" >MailController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/PermissionsController.html" data-type="entity-link" >PermissionsController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/ResumesController.html" data-type="entity-link" >ResumesController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/RolesController.html" data-type="entity-link" >RolesController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/SubscribersController.html" data-type="entity-link" >SubscribersController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/UsersController.html" data-type="entity-link" >UsersController</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/Company.html" data-type="entity-link" >Company</a>
                            </li>
                            <li class="link">
                                <a href="classes/Company-1.html" data-type="entity-link" >Company</a>
                            </li>
                            <li class="link">
                                <a href="classes/Company-2.html" data-type="entity-link" >Company</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateCompanyDto.html" data-type="entity-link" >CreateCompanyDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateFileDto.html" data-type="entity-link" >CreateFileDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateJobDto.html" data-type="entity-link" >CreateJobDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreatePermissionDto.html" data-type="entity-link" >CreatePermissionDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateResumeDto.html" data-type="entity-link" >CreateResumeDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateRoleDto.html" data-type="entity-link" >CreateRoleDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateSubscriberDto.html" data-type="entity-link" >CreateSubscriberDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateUserCvDto.html" data-type="entity-link" >CreateUserCvDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateUserDto.html" data-type="entity-link" >CreateUserDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/File.html" data-type="entity-link" >File</a>
                            </li>
                            <li class="link">
                                <a href="classes/History.html" data-type="entity-link" >History</a>
                            </li>
                            <li class="link">
                                <a href="classes/Job.html" data-type="entity-link" >Job</a>
                            </li>
                            <li class="link">
                                <a href="classes/Permission.html" data-type="entity-link" >Permission</a>
                            </li>
                            <li class="link">
                                <a href="classes/RegisterUserDto.html" data-type="entity-link" >RegisterUserDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/Resume.html" data-type="entity-link" >Resume</a>
                            </li>
                            <li class="link">
                                <a href="classes/Role.html" data-type="entity-link" >Role</a>
                            </li>
                            <li class="link">
                                <a href="classes/Subscriber.html" data-type="entity-link" >Subscriber</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateCompanyDto.html" data-type="entity-link" >UpdateCompanyDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdatedBy.html" data-type="entity-link" >UpdatedBy</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateFileDto.html" data-type="entity-link" >UpdateFileDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateJobDto.html" data-type="entity-link" >UpdateJobDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdatePermissionDto.html" data-type="entity-link" >UpdatePermissionDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateResumeDto.html" data-type="entity-link" >UpdateResumeDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateRoleDto.html" data-type="entity-link" >UpdateRoleDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateSubscriberDto.html" data-type="entity-link" >UpdateSubscriberDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateUserDto.html" data-type="entity-link" >UpdateUserDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/User.html" data-type="entity-link" >User</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserLoginDto.html" data-type="entity-link" >UserLoginDto</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AppService.html" data-type="entity-link" >AppService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthService.html" data-type="entity-link" >AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CompaniesService.html" data-type="entity-link" >CompaniesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DatabasesService.html" data-type="entity-link" >DatabasesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FilesService.html" data-type="entity-link" >FilesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/HealthService.html" data-type="entity-link" >HealthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/JobsService.html" data-type="entity-link" >JobsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/JwtAuthGuard.html" data-type="entity-link" >JwtAuthGuard</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/JwtStrategy.html" data-type="entity-link" >JwtStrategy</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LocalAuthGuard.html" data-type="entity-link" >LocalAuthGuard</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LocalStrategy.html" data-type="entity-link" >LocalStrategy</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MailService.html" data-type="entity-link" >MailService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MulterConfigService.html" data-type="entity-link" >MulterConfigService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PermissionsService.html" data-type="entity-link" >PermissionsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ResumesService.html" data-type="entity-link" >ResumesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/RolesService.html" data-type="entity-link" >RolesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SubscribersService.html" data-type="entity-link" >SubscribersService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TransformInterceptor.html" data-type="entity-link" >TransformInterceptor</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UsersService.html" data-type="entity-link" >UsersService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/IUser.html" data-type="entity-link" >IUser</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Response.html" data-type="entity-link" >Response</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});