<?php

it('returns a successful response', function () {
    $response = $this->get('/');

    $response->assertStatus(200);
});

it('returns a successful response for craftsmanship page', function () {
    $response = $this->get('/craftsmanship');

    $response->assertStatus(200);
});
