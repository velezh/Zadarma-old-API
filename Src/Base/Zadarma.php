<?php

namespace Base;

use Base\ZadarmaApi;

class Zadarma extends ZadarmaApi {

    const STATUS_SUCCESS                = 'success';

	const EVENT_NOTIFY_START			= 'NOTIFY_START';
	const EVENT_NOTIFY_INTERNAL			= 'NOTIFY_INTERNAL';
	const EVENT_NOTIFY_ANSWER			= 'NOTIFY_ANSWER';
	const EVENT_NOTIFY_END				= 'NOTIFY_END';
	const EVENT_NOTIFY_OUT_START		= 'NOTIFY_OUT_START';
	const EVENT_NOTIFY_OUT_END			= 'NOTIFY_OUT_END';
	const EVENT_NOTIFY_RECORD			= 'NOTIFY_RECORD';

	const NOTIFY_START_PARAMS		= ['pbx_call_id', 'call_start', 'caller_id', 'called_did'];
	const NOTIFY_END_PARAMS			= ['pbx_call_id', 'call_start', 'caller_id', 'called_did', 'duration', 'disposition', 'status_code', 'is_recorded'];
	const NOTIFY_ANSWER_PARAMS		= ['pbx_call_id', 'call_start', 'caller_id', 'destination'];
	const NOTIFY_OUT_START_PARAMS	= ['pbx_call_id', 'call_start', 'destination'];
	const NOTIFY_OUT_END_PARAMS		= ['pbx_call_id', 'call_start', 'internal', 'destination', 'duration', 'disposition', 'status_code', 'is_recorded'];
	const NOTIFY_RECORD_PARAMS		= ['pbx_call_id', 'call_id_with_rec'];

	public function v1_get_info_balance() {

		$answer = $this->call('/v1/info/balance/');

		return $this->_decodeJSONAnswer($answer);

	}

	public function v1_get_sip() {

		$answer = $this->call('/v1/sip/');

		return $this->_decodeJSONAnswer($answer);

	}

	public function v1_get_direct_numbers() {

		$answer = $this->call('/v1/direct_numbers/');

		return $this->_decodeJSONAnswer($answer);

	}

	public function v1_pbx_get_internal() {

		$answer = $this->call('/v1/pbx/internal/');

		return $this->_decodeJSONAnswer($answer);

	}

	public function v1_get_request_callback($from,$to,$sip=null,$predicted=null) {

		$params = array('from'=>$from,'to'=>$to);

		if ($sip)
			$params['sip'] = $sip;

		if ($predicted)
			$params['predicted'] = $predicted;

		$answer = $this->call('/v1/request/callback/',$params);

		return $this->_decodeJSONAnswer($answer);

	}

	public function v1_pbx_get_record_request($call_id=null,$pbx_call_id=null) {

		$params = array();

		if ($call_id)
			$params['call_id'] = $call_id;

		if ($pbx_call_id)
			$params['pbx_call_id'] = $pbx_call_id;

		$answer = $this->call('/v1/pbx/record/request/',$params);

		return $this->_decodeJSONAnswer($answer);

	}

	protected function _decodeJSONAnswer($json) {

		return json_decode($json,true);

	}

    public static function getPlainPhone($phone) {

        $atpos = strpos($phone, '@');

        if ($atpos !== false) {

            $phone = substr($phone, 0, $atpos);

        }

        if (substr($phone, 0, 1) != '+') {

            return '+'.$phone;

        }

        return $phone;

    }

    public static function validateEventData(&$data) {

    	if (array_key_exists('event', $data)/* || array_key_exists('notification_mnemonic', $data)*/) {

    		if ($data['event'] == self::EVENT_NOTIFY_START/* ||
    			$data['notification_mnemonic'] == self::MNEMONIC_IN_CALL_SESSION*/) {

    			if (count(array_intersect_key(array_flip(self::NOTIFY_START_PARAMS), $data)) === count(self::NOTIFY_START_PARAMS)) {
		            return self::EVENT_NOTIFY_START;
		        } else {
		        	throw new InvalidArgumentException();
		        }

    		} elseif ($data['event'] == self::EVENT_NOTIFY_ANSWER/* ||
    			$data['notification_mnemonic'] == self::MNEMONIC_CALL_CONNECTED*/) {

    			if (count(array_intersect_key(array_flip(self::NOTIFY_ANSWER_PARAMS), $data)) === count(self::NOTIFY_ANSWER_PARAMS)) {
		            return self::EVENT_NOTIFY_ANSWER;
		        } else {
		        	throw new InvalidArgumentException();
		        }

    		} elseif ($data['event'] == self::EVENT_NOTIFY_END/* ||
    			$data['notification_mnemonic'] == self::MNEMONIC_CALL_SESSION_FINISHED*/) {

    			if (count(array_intersect_key(array_flip(self::NOTIFY_END_PARAMS), $data)) === count(self::NOTIFY_END_PARAMS)) {
		            return self::EVENT_NOTIFY_END;
		        } else {
		        	throw new InvalidArgumentException();
		        }

    		} elseif ($data['event'] == self::EVENT_NOTIFY_OUT_START) {

    			if (count(array_intersect_key(array_flip(self::NOTIFY_OUT_START_PARAMS), $data)) === count(self::NOTIFY_OUT_START_PARAMS)) {
		            return self::EVENT_NOTIFY_OUT_START;
		        } else {
		        	throw new InvalidArgumentException();
		        }

    		} elseif ($data['event'] == self::EVENT_NOTIFY_OUT_END) {

    			if (count(array_intersect_key(array_flip(self::NOTIFY_OUT_END_PARAMS), $data)) === count(self::NOTIFY_OUT_END_PARAMS)) {
		            return self::EVENT_NOTIFY_OUT_END;
		        } else {
		        	throw new InvalidArgumentException();
		        }

    		} elseif ($data['event'] == self::EVENT_NOTIFY_RECORD) {

    			if (count(array_intersect_key(array_flip(self::NOTIFY_RECORD_PARAMS), $data)) === count(self::NOTIFY_RECORD_PARAMS)) {
		            return self::EVENT_NOTIFY_RECORD;
		        } else {
		        	throw new InvalidArgumentException();
		        }

    		}

    	}

		return null;

    }

}

